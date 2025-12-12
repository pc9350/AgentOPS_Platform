"""
Request Tracker
Context manager for tracking request lifecycle and measuring latency.
"""
import time
from typing import Optional
from contextlib import contextmanager


class RequestTracker:
    """Tracks request timing and other metrics."""
    
    def __init__(self):
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None
        self.metadata: dict = {}
    
    def __enter__(self):
        """Start tracking."""
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Stop tracking."""
        self.end_time = time.time()
        return False  # Don't suppress exceptions
    
    def start(self):
        """Manually start tracking."""
        self.start_time = time.time()
    
    def stop(self):
        """Manually stop tracking."""
        self.end_time = time.time()
    
    def get_latency_ms(self) -> int:
        """Get elapsed time in milliseconds."""
        if self.start_time is None:
            return 0
        
        end = self.end_time or time.time()
        return int((end - self.start_time) * 1000)
    
    def get_latency_seconds(self) -> float:
        """Get elapsed time in seconds."""
        return self.get_latency_ms() / 1000
    
    def add_metadata(self, key: str, value):
        """Add metadata to the tracker."""
        self.metadata[key] = value
    
    def get_summary(self) -> dict:
        """Get a summary of tracking data."""
        return {
            "latency_ms": self.get_latency_ms(),
            "start_time": self.start_time,
            "end_time": self.end_time,
            **self.metadata,
        }


@contextmanager
def track_request():
    """Context manager for tracking a request."""
    tracker = RequestTracker()
    tracker.start()
    try:
        yield tracker
    finally:
        tracker.stop()

