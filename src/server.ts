import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from "@angular/ssr/node";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, "../browser");

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */
// app.get("/api/stream-response", async (req, res) => {
//   ai.models
//     .generateContentStream({
//       model: "gemini-2.0-flash",
//       contents: "Explain how AI works",
//     })
//     .then(async (response) => {
//       for await (const chunk of response) {
//         res.write(chunk.text);
//       }
//     });
// });

let response =
  "Artificial intelligence (AI) is transforming the world in unprecedented ways, revolutionizing industries, enhancing productivity, and enabling new forms of creativity. At its core, AI refers to the simulation of human intelligence in machines that are programmed to think, learn, and solve problems. Modern AI systems leverage vast amounts of data, advanced algorithms, and powerful computing resources to perform tasks  that once required human expertise. \nOne of the most significant breakthroughs in AI has been the development of deep learning, a subset of machine learning that uses neural networks with many layers. Deep learning models have achieved remarkable success in areas such as image recognition, natural language processing, and autonomous vehicles. For example, AI-powered medical imaging systems can detect diseases with accuracy comparable to or even surpassing human doctors, while language models can generate coherent and contextually relevant text, translate languages, and answer complex questions. AI is also driving innovation in robotics, enabling machines to navigate complex environments, manipulate objects, and interact with humans in natural ways. In manufacturing, AI-powered robots are improving efficiency and safety, while in agriculture, AI systems are optimizing crop yields and resource usage. The integration of AI into everyday devices, such as smartphones and smart home assistants, is making technology more intuitive and accessible. \nHowever, the rapid advancement of AI raises important ethical and societal questions. Issues such as bias in algorithms, data privacy, and the impact of automation on jobs require careful consideration and responsible governance. Researchers and policymakers are working to ensure that AI technologies are developed and deployed in ways that are fair, transparent, and beneficial to all. \n In summary, AI is a powerful tool that holds immense promise for the future. By harnessing its capabilities responsibly, we can address some of the world’s most pressing challenges and unlock new opportunities for growth and discovery.";

function getAIResponse(): Promise<Uint8Array<ArrayBuffer>> {
  // const responseArray = [{ text: response.split(" ") }];
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(response);

  return Promise.resolve(uint8Array);
}

app.get("/api/stream-response", async (req, res) => {
  res.setHeader("Content-Type", "text/uint8Array");
  for (const chunk of response.split(" ")) {
    res.write(chunk + " ");
    await new Promise((resolve) => setTimeout(resolve, 50)); // simulate delay
  }
  res.end();
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: "1y",
    index: false,
    redirect: false,
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use("/**", (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env["PORT"] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
