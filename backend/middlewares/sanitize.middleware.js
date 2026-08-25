const xss = require("xss");
const mongoSanitize = require("express-mongo-sanitize");

// Options for XSS sanitizer - strict stripping of HTML tags
const xssOptions = {
  whiteList: {}, // No HTML tags permitted in general text fields
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "xml", "iframe"],
};

const xssSanitizer = new xss.FilterXSS(xssOptions);

// Recursive helper function to sanitize objects, arrays, and strings
const sanitizeValue = (value) => {
  if (typeof value === "string") {
    // Sanitize XSS scripts & trim whitespace
    return xssSanitizer.process(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    const sanitizedObj = {};
    for (const key of Object.keys(value)) {
      // Prevent Prototype Pollution by blocking __proto__, constructor, and prototype keys
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      sanitizedObj[key] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }
  return value;
};

// Express 5 Compatible Combined NoSQL & XSS Input Sanitizer Middleware
// Modifies object properties in-place without reassigning read-only Express 5 req.query getter
const sanitizeInputMiddleware = (req, res, next) => {
  try {
    // 1. Express 5 Compatible NoSQL In-Place Property Sanitization
    if (req.body && typeof req.body === "object") {
      mongoSanitize.sanitize(req.body, { replaceWith: "_" });
    }
    if (req.params && typeof req.params === "object") {
      mongoSanitize.sanitize(req.params, { replaceWith: "_" });
    }
    if (req.query && typeof req.query === "object") {
      mongoSanitize.sanitize(req.query, { replaceWith: "_" });
    }

    // 2. XSS & HTML Script Injection In-Place Sanitization
    if (req.body) {
      req.body = sanitizeValue(req.body);
    }
    if (req.query && typeof req.query === "object") {
      for (const key of Object.keys(req.query)) {
        req.query[key] = sanitizeValue(req.query[key]);
      }
    }
    if (req.params && typeof req.params === "object") {
      for (const key of Object.keys(req.params)) {
        req.params[key] = sanitizeValue(req.params[key]);
      }
    }
  } catch (err) {
    console.error("Input Sanitization Error:", err);
  }
  next();
};

module.exports = {
  sanitizeInputMiddleware,
  sanitizeValue,
};
