const rateLimitMap = new Map<string, { count: number; time: number }>();

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { success: boolean; remaining: number; resetTime: number } {
  const { windowMs = 60000, maxRequests = 60 } = options;
  const now = Date.now();
  const data = rateLimitMap.get(identifier) || { count: 0, time: now };

  if (now - data.time < windowMs) {
    if (data.count >= maxRequests) {
      const resetTime = Math.ceil((data.time + windowMs - now) / 1000);
      return { success: false, remaining: 0, resetTime };
    }
    data.count++;
  } else {
    data.count = 1;
    data.time = now;
  }

  rateLimitMap.set(identifier, data);
  const remaining = maxRequests - data.count;
  const resetTime = Math.ceil((data.time + windowMs - now) / 1000);

  return { success: true, remaining, resetTime };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.time > 300000) { // 5 minutes
      rateLimitMap.delete(key);
    }
  }
}, 60000);
