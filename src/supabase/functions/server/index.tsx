import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Restrictive CORS for internal use only
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://studio.interno.tu-dominio.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'false',
};

app.use("*", cors({ 
  origin: ["https://studio.interno.tu-dominio.com"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));
app.use("*", logger(console.log));

// Supabase client setup
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Initialize storage buckets
async function initializeBuckets() {
  // Brand kits bucket
  const brandkitsBucket = "make-ecf7df64-brandkits";
  const exportsBucket = "make-ecf7df64-exports";
  
  const { data: buckets } = await supabase.storage.listBuckets();
  
  // Create brandkits bucket if it doesn't exist
  const brandkitsExists = buckets?.some(bucket => bucket.name === brandkitsBucket);
  if (!brandkitsExists) {
    const { error } = await supabase.storage.createBucket(brandkitsBucket, {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']
    });
    
    if (error) {
      console.error("Error creating brandkits bucket:", error);
    } else {
      console.log("Brandkits bucket created successfully");
    }
  }
  
  // Create exports bucket if it doesn't exist
  const exportsExists = buckets?.some(bucket => bucket.name === exportsBucket);
  if (!exportsExists) {
    const { error } = await supabase.storage.createBucket(exportsBucket, {
      public: false,
      fileSizeLimit: 52428800, // 50MB for PDFs
      allowedMimeTypes: ['application/pdf']
    });
    
    if (error) {
      console.error("Error creating exports bucket:", error);
    } else {
      console.log("Exports bucket created successfully");
    }
  }
}

// Initialize buckets on startup
initializeBuckets();

// Health check
app.get("/make-server-ecf7df64/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Upload brand manual endpoint
app.post("/make-server-ecf7df64/upload-brand-manual", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type" }, 400);
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return c.json({ error: "File too large" }, 400);
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const bucketName = "make-ecf7df64-brandkits";
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Upload error:", error);
      return c.json({ error: "Upload failed" }, 500);
    }

    // Create signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60); // 1 hour expiry

    return c.json({
      success: true,
      fileName: fileName,
      uploadedAt: new Date().toISOString(),
      signedUrl: urlData?.signedUrl
    });

  } catch (error) {
    console.error("Error uploading brand manual:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Analyze brand manual with AI using Gemini
app.post("/make-server-ecf7df64/analyze-brand-manual", async (c) => {
  const startTime = Date.now();
  
  try {
    console.log("=== Brand Manual Analysis Request ===");
    
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      console.error("No file provided in request");
      return c.json({ error: "No file provided" }, 400);
    }

    console.log(`File received: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    // Validate environment
    const hasGoogleAI = !!Deno.env.get("GOOGLE_AI_API_KEY");
    console.log(`Google AI API Key available: ${hasGoogleAI}`);
    
    if (!hasGoogleAI) {
      console.warn("Google AI API Key not configured, analysis will use fallback");
    }
    
    // Import and use the BrandAnalyzer
    console.log("Initializing BrandAnalyzer...");
    const { BrandAnalyzer } = await import("./brand-analyzer.tsx");
    const analyzer = new BrandAnalyzer();
    
    // Analyze the file with Gemini
    console.log("Starting file analysis...");
    const normalizedBrandKit = await analyzer.analyzeFile(file);
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`Analysis completed in ${processingTime}s`);
    console.log(`Brand detected: ${normalizedBrandKit.meta.brandName}`);
    console.log(`Colors found: ${normalizedBrandKit.colors.primary.length} primary, ${normalizedBrandKit.colors.secondary.length} secondary`);
    console.log(`Typography: ${normalizedBrandKit.typography.primary.name}`);

    // Save the normalized BrandKit to storage
    console.log("Saving to persistent storage...");
    const { set } = await import("./kv_store.tsx");
    await set("brandkit_data", JSON.stringify(normalizedBrandKit));
    console.log("BrandKit saved successfully");

    return c.json({
      success: true,
      analysis: normalizedBrandKit,
      analyzedAt: new Date().toISOString(),
      processingTime: `${processingTime}s`,
      extractedBy: hasGoogleAI ? "Gemini AI with normalization" : "Fallback analysis",
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    });

  } catch (error) {
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error("=== Brand Manual Analysis Error ===");
    console.error(`Processing time: ${processingTime}s`);
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);
    
    return c.json({ 
      success: false,
      error: `Analysis failed: ${error.message}`,
      processingTime: `${processingTime}s`,
      timestamp: new Date().toISOString(),
      details: error.stack 
    }, 500);
  }
});

// Save brand kit data
app.post("/make-server-ecf7df64/save-brandkit", async (c) => {
  try {
    const brandKitData = await c.req.json();
    
    // Save to key-value store
    const { set } = await import("./kv_store.tsx");
    await set("brandkit_data", JSON.stringify(brandKitData));
    
    return c.json({
      success: true,
      savedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error saving brand kit:", error);
    return c.json({ error: "Save failed" }, 500);
  }
});

// Get brand kit data
app.get("/make-server-ecf7df64/get-brandkit", async (c) => {
  try {
    const { get } = await import("./kv_store.tsx");
    const brandKitData = await get("brandkit_data");
    
    if (!brandKitData) {
      return c.json({ success: false, message: "No brand kit found" });
    }

    return c.json({
      success: true,
      data: JSON.parse(brandKitData),
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error retrieving brand kit:", error);
    return c.json({ error: "Retrieval failed" }, 500);
  }
});

// Apply brand kit to content
app.post("/make-server-ecf7df64/apply-brand", async (c) => {
  try {
    const { content, contentType } = await c.req.json();
    
    if (!content || !contentType) {
      return c.json({ error: "Content and contentType are required" }, 400);
    }

    const { BrandIntegration } = await import("./brand-integration.tsx");
    const brandedContent = await BrandIntegration.applyBrandToContent(content, contentType);

    return c.json({
      success: true,
      brandedContent,
      appliedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error applying brand to content:", error);
    return c.json({ error: "Brand application failed" }, 500);
  }
});

// Validate content against brand
app.post("/make-server-ecf7df64/validate-brand", async (c) => {
  try {
    const { content } = await c.req.json();
    
    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    const { BrandIntegration } = await import("./brand-integration.tsx");
    const validation = await BrandIntegration.validateContentAgainstBrand(content);

    return c.json({
      success: true,
      validation,
      validatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error validating content against brand:", error);
    return c.json({ error: "Brand validation failed" }, 500);
  }
});

// Health check endpoint
app.get("/make-server-ecf7df64/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    server: "make-server-ecf7df64"
  });
});

// Diagnostic endpoint for AI models
app.get("/make-server-ecf7df64/ai-models", async (c) => {
  try {
    const hasGoogleAI = !!Deno.env.get("GOOGLE_AI_API_KEY");
    const hasOpenAI = !!Deno.env.get("OPENAI_API_KEY");
    
    let geminiStatus = "not configured";
    let availableModels: string[] = [];
    
    if (hasGoogleAI) {
      try {
        const { GoogleGenerativeAI } = await import("npm:@google/generative-ai");
        const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_AI_API_KEY")!);
        
        // Test common models with correct library names
        const testModels = [
          "gemini-1.5-flash",
          "gemini-1.5-pro"
        ];
        
        for (const modelName of testModels) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Just test model initialization (don't make actual API calls)
            availableModels.push(modelName);
          } catch (error) {
            console.log(`Model ${modelName} not available:`, error.message);
          }
        }
        
        geminiStatus = availableModels.length > 0 ? "available" : "configured but no models accessible";
        
      } catch (error) {
        geminiStatus = `error: ${error.message}`;
      }
    }

    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      apis: {
        googleAI: {
          configured: hasGoogleAI,
          status: geminiStatus,
          availableModels: availableModels
        },
        openAI: {
          configured: hasOpenAI,
          status: hasOpenAI ? "configured" : "not configured"
        }
      }
    });
    
  } catch (error) {
    console.error("Error checking AI models:", error);
    return c.json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Test real connectivity with Gemini models
app.post("/make-server-ecf7df64/test-gemini", async (c) => {
  try {
    const hasGoogleAI = !!Deno.env.get("GOOGLE_AI_API_KEY");
    
    if (!hasGoogleAI) {
      return c.json({
        success: false,
        error: "GOOGLE_AI_API_KEY not configured"
      }, 400);
    }

    const { GoogleGenerativeAI } = await import("npm:@google/generative-ai");
    const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_AI_API_KEY")!);
    
    // Test with a simple prompt
    const testPrompt = "Say 'Hello' in Spanish";
    let workingModel = null;
    let response = null;
    
    const modelsToTest = [
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(testPrompt);
        const text = await result.response.text();
        
        workingModel = modelName;
        response = text;
        console.log(`✅ Model ${modelName} working, response: ${text}`);
        break;
        
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`);
        continue;
      }
    }

    if (workingModel) {
      return c.json({
        success: true,
        workingModel,
        response,
        timestamp: new Date().toISOString()
      });
    } else {
      return c.json({
        success: false,
        error: "No Gemini models are working. Check your API key and model access.",
        timestamp: new Date().toISOString()
      }, 500);
    }
    
  } catch (error) {
    console.error("Error testing Gemini connectivity:", error);
    return c.json({
      success: false,
      error: `Gemini test failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// List available Gemini models for debugging
app.get("/make-server-ecf7df64/list-models", async (c) => {
  try {
    const hasGoogleAI = !!Deno.env.get("GOOGLE_AI_API_KEY");
    
    if (!hasGoogleAI) {
      return c.json({
        success: false,
        error: "GOOGLE_AI_API_KEY not configured"
      }, 400);
    }

    const { GoogleGenerativeAI } = await import("npm:@google/generative-ai");
    const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_AI_API_KEY")!);
    
    // Use the listModels method if available
    try {
      const models = await genAI.listModels();
      console.log("Available models:", models);
      
      return c.json({
        success: true,
        models: models,
        timestamp: new Date().toISOString()
      });
      
    } catch (listError) {
      console.log("listModels not available, will test individual models:", listError.message);
      
      // Fallback: test individual models
      const testModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
      const availableModels = [];
      
      for (const modelName of testModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          availableModels.push({
            name: modelName,
            available: true
          });
        } catch (error) {
          availableModels.push({
            name: modelName,
            available: false,
            error: error.message
          });
        }
      }
      
      return c.json({
        success: true,
        models: availableModels,
        note: "Listed from testing individual models",
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error("Error listing Gemini models:", error);
    return c.json({
      success: false,
      error: `Failed to list models: ${error.message}`,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// =============================================
// BRAND GUARD SERVICE ROUTES
// =============================================

// =============================================
// SIMPLIFIED CHAT SERVICE ROUTES
// =============================================

// Placeholder export endpoints (will be implemented later)
app.post("/make-server-ecf7df64/api/export/md", async (c) => {
  return c.json({ success: false, error: "Export functionality not implemented yet" }, 501);
});

app.post("/make-server-ecf7df64/api/export/html", async (c) => {
  return c.json({ success: false, error: "Export functionality not implemented yet" }, 501);
});

app.post("/make-server-ecf7df64/api/export/pdf", async (c) => {
  return c.json({ success: false, error: "Export functionality not implemented yet" }, 501);
});

// Placeholder share endpoints
app.post("/make-server-ecf7df64/api/share/create", async (c) => {
  return c.json({ success: false, error: "Share functionality not implemented yet" }, 501);
});

app.post("/make-server-ecf7df64/api/share/revoke", async (c) => {
  return c.json({ success: false, error: "Share functionality not implemented yet" }, 501);
});

app.get("/make-server-ecf7df64/api/share/get", async (c) => {
  return c.json({ success: false, error: "Share functionality not implemented yet" }, 501);
});

// Placeholder threads management
app.get("/make-server-ecf7df64/api/threads/list", async (c) => {
  return c.json({ 
    success: true, 
    threads: [
      {
        id: "demo-thread-1",
        title: "Demo Thread",
        lastMessage: "Welcome to the demo",
        updatedAt: new Date().toISOString(),
        messageCount: 1,
        branches: [
          { id: "main", name: "Principal", isDefault: true }
        ]
      }
    ]
  });
});

app.post("/make-server-ecf7df64/api/thread/create", async (c) => {
  const body = await c.req.json();
  return c.json({ 
    success: true, 
    id: `thread_${Date.now()}`,
    title: body.title || "New Thread"
  });
});

app.post("/make-server-ecf7df64/api/thread/rename", async (c) => {
  return c.json({ success: true });
});

app.post("/make-server-ecf7df64/api/thread/delete", async (c) => {
  return c.json({ success: true });
});

// Placeholder branches management
app.post("/make-server-ecf7df64/api/branch/create", async (c) => {
  const body = await c.req.json();
  return c.json({ 
    success: true, 
    id: `branch_${Date.now()}`,
    name: body.name || "New Branch"
  });
});

app.post("/make-server-ecf7df64/api/branch/rename", async (c) => {
  return c.json({ success: true });
});

app.post("/make-server-ecf7df64/api/branch/delete", async (c) => {
  return c.json({ success: true });
});

app.post("/make-server-ecf7df64/api/branch/switch", async (c) => {
  return c.json({ success: true });
});

app.post("/make-server-ecf7df64/api/message/branch-from", async (c) => {
  const body = await c.req.json();
  return c.json({ 
    success: true, 
    branchId: `branch_${Date.now()}`,
    name: body.name || "New Branch"
  });
});

// =============================================
// CHAT SERVICE ROUTES (Simplified Demo)
// =============================================

// Chat streaming endpoint
app.post("/make-server-ecf7df64/api/chat/stream", async (c) => {
  try {
    const body = await c.req.json();
    
    // Simple demo response
    return c.json({
      success: true,
      runId: body.runId || `run_${Date.now()}`,
      message: "Chat streaming temporarily simplified for demo",
      received: body
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Chat streaming error"
    }, 500);
  }
});

// Chat abort endpoint
app.post("/make-server-ecf7df64/api/chat/abort", async (c) => {
  try {
    const body = await c.req.json();
    
    return c.json({
      success: true,
      message: "Chat aborted",
      threadId: body.threadId,
      runId: body.runId
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Chat abort error"
    }, 500);
  }
});

// Chat regenerate endpoint
app.post("/make-server-ecf7df64/api/chat/regenerate", async (c) => {
  try {
    const body = await c.req.json();
    
    return c.json({
      success: true,
      message: "Message regenerated",
      threadId: body.threadId,
      messageId: body.messageId,
      nudge: body.nudge
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Chat regenerate error"
    }, 500);
  }
});

// Chat attachment sign upload endpoint
app.post("/make-server-ecf7df64/api/chat/attach/sign", async (c) => {
  try {
    const body = await c.req.json();
    
    return c.json({
      success: true,
      url: "/demo-upload-url",
      fields: {
        key: `attachments/${body.threadId}/${Date.now()}`,
        "Content-Type": body.contentType
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Sign upload error"
    }, 500);
  }
});

// Chat thread save endpoint
app.post("/make-server-ecf7df64/api/chat/thread/save", async (c) => {
  try {
    const body = await c.req.json();
    
    // Save to KV store
    const { set } = await import("./kv_store.tsx");
    await set(`thread_${body.id}`, JSON.stringify(body));
    
    return c.json({
      success: true,
      message: "Thread saved",
      threadId: body.id
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Thread save error"
    }, 500);
  }
});

// Brand Guard endpoints
app.post("/make-server-ecf7df64/api/guard/check", async (c) => {
  try {
    const body = await c.req.json();
    
    // Simple demo brand guard response
    return c.json({
      success: true,
      analysis: {
        status: "approved",
        confidence: 0.95,
        issues: [],
        suggestions: []
      },
      content: body.content
    });
  } catch (error) {
    return c.json({
      success: false,
      error: "Brand guard check failed"
    }, 500);
  }
});

app.post("/make-server-ecf7df64/api/guard/rules/update", async (c) => {
  return c.json({ success: true, message: "Brand guard rules updated" });
});

// Telemetry/Events endpoint for frontend metrics
app.post("/make-server-ecf7df64/api/events", async (c) => {
  try {
    const event = await c.req.json();
    
    // Log the event (in production, you'd send to analytics service)
    console.log("[TELEMETRY]", JSON.stringify(event, null, 2));
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to log event" }, 500);
  }
});

// Generic events endpoint (alias)
app.post("/api/events", async (c) => {
  return app.fetch(new Request("/make-server-ecf7df64/api/events", {
    method: "POST",
    headers: c.req.headers,
    body: c.req.body
  }));
});

Deno.serve(app.fetch);