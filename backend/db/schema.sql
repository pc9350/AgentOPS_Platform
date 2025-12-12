-- AgentOps Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============== CONVERSATIONS TABLE ==============
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    session_id TEXT,
    user_input TEXT NOT NULL,
    model_output TEXT NOT NULL,
    model TEXT NOT NULL,
    latency_ms INTEGER NOT NULL,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    cost_usd DECIMAL(10, 6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_model ON conversations(model);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Service role bypass for backend operations
CREATE POLICY "Service role has full access to conversations" ON conversations
    FOR ALL USING (auth.role() = 'service_role');


-- ============== EVALUATIONS TABLE ==============
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    coherence_score DECIMAL(4, 3),
    factuality_score DECIMAL(4, 3),
    helpfulness_score DECIMAL(4, 3),
    safety_risk DECIMAL(4, 3),
    sop_violations JSONB DEFAULT '[]'::jsonb,
    evaluator_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for joining with conversations
CREATE INDEX IF NOT EXISTS idx_evaluations_conversation_id ON evaluations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_safety_risk ON evaluations(safety_risk DESC);

-- Enable RLS
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view evaluations for their conversations
CREATE POLICY "Users can view own evaluations" ON evaluations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = evaluations.conversation_id 
            AND conversations.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Service role has full access to evaluations" ON evaluations
    FOR ALL USING (auth.role() = 'service_role');


-- ============== PROMPT IMPROVEMENTS TABLE ==============
CREATE TABLE IF NOT EXISTS prompt_improvements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    new_prompt TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for joining
CREATE INDEX IF NOT EXISTS idx_prompt_improvements_conversation_id ON prompt_improvements(conversation_id);

-- Enable RLS
ALTER TABLE prompt_improvements ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view own prompt improvements" ON prompt_improvements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = prompt_improvements.conversation_id 
            AND conversations.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Service role has full access to prompt_improvements" ON prompt_improvements
    FOR ALL USING (auth.role() = 'service_role');


-- ============== HELPER VIEWS ==============

-- View for dashboard statistics
CREATE OR REPLACE VIEW conversation_stats AS
SELECT 
    user_id,
    COUNT(*) as total_conversations,
    AVG(latency_ms) as avg_latency_ms,
    SUM(cost_usd) as total_cost_usd,
    AVG(input_tokens) as avg_input_tokens,
    AVG(output_tokens) as avg_output_tokens
FROM conversations
GROUP BY user_id;

-- View for model usage distribution
CREATE OR REPLACE VIEW model_usage AS
SELECT 
    user_id,
    model,
    COUNT(*) as usage_count,
    AVG(latency_ms) as avg_latency,
    SUM(cost_usd) as total_cost
FROM conversations
GROUP BY user_id, model;

-- View for safety risk summary
CREATE OR REPLACE VIEW safety_summary AS
SELECT 
    c.user_id,
    COUNT(*) as total_evaluations,
    AVG(e.safety_risk) as avg_safety_risk,
    COUNT(CASE WHEN e.safety_risk > 0.5 THEN 1 END) as high_risk_count,
    COUNT(CASE WHEN e.safety_risk > 0.8 THEN 1 END) as critical_risk_count
FROM conversations c
JOIN evaluations e ON c.id = e.conversation_id
GROUP BY c.user_id;


-- ============== FUNCTIONS ==============

-- Function to get conversation with full evaluation details
CREATE OR REPLACE FUNCTION get_conversation_with_evaluation(conv_id UUID)
RETURNS TABLE (
    conversation JSONB,
    evaluation JSONB,
    prompt_improvement JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(c.*) as conversation,
        to_jsonb(e.*) as evaluation,
        to_jsonb(p.*) as prompt_improvement
    FROM conversations c
    LEFT JOIN evaluations e ON c.id = e.conversation_id
    LEFT JOIN prompt_improvements p ON c.id = p.conversation_id
    WHERE c.id = conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

