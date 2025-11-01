# AI Chatbot Setup Guide

This guide explains how to set up and configure the open-source AI chatbot on your Amazing Grace Church website.

## 📋 Overview

The AI chatbot appears on all pages as a floating button in the bottom-right corner. It can answer frequently asked questions about:
- Service times
- How to join ministries (band, etc.)
- Church location and contact information
- Events and activities
- Sermons
- Giving and donations
- And more!

## 🚀 Quick Setup

### Option 1: Hugging Face Inference API (Recommended - Free Tier Available)

1. **Create a Hugging Face Account**
   - Go to [https://huggingface.co](https://huggingface.co)
   - Sign up for a free account

2. **Get Your API Key**
   - Go to Settings > Access Tokens
   - Create a new token with "Read" permissions
   - Copy the token

3. **Add to Environment Variables**
   ```env
   HUGGINGFACE_API_KEY="your-api-key-here"
   HUGGINGFACE_API_URL="https://api-inference.huggingface.co/models"
   AI_MODEL="mistralai/Mistral-7B-Instruct-v0.2"
   ```

4. **Free Models Available**
   - `mistralai/Mistral-7B-Instruct-v0.2` (Recommended)
   - `meta-llama/Llama-3.2-3B-Instruct`
   - `google/flan-t5-large` (Lightweight)

### Option 2: Ollama (Local Deployment - No API Key Needed)

1. **Install Ollama**
   - Download from [https://ollama.ai](https://ollama.ai)
   - Install on your server or local machine

2. **Pull a Model**
   ```bash
   ollama pull llama3.2
   # or
   ollama pull mistral
   ```

3. **Update API Route**
   - Modify `src/app/api/ai/chat/route.ts`
   - Uncomment the Ollama section
   - Update `OLLAMA_API_URL` if needed

4. **Add Environment Variables**
   ```env
   OLLAMA_API_URL="http://localhost:11434/api/generate"
   OLLAMA_MODEL="llama3.2"
   ```

### Option 3: No API Key (Fallback Mode)

The chatbot will work without an API key using rule-based responses. It will answer common questions using the knowledge base, but responses will be simpler.

## 📁 Files Created

- `src/components/ai-chatbot.tsx` - Chatbot widget component
- `src/app/api/ai/chat/route.ts` - API route for AI queries
- `src/lib/knowledge-base.ts` - Church knowledge base and FAQs
- `src/app/layout.tsx` - Updated to include chatbot on all pages

## 🎯 Features

### Chatbot Widget
- Floating button in bottom-right corner
- Beautiful chat interface
- Suggested questions for quick help
- Conversation history
- Responsive design
- Works on all pages

### Knowledge Base
The chatbot knows about:
- Service times and schedules
- Church location and contact info
- How to join ministries
- Giving options
- Events and activities
- Sermons
- General church information

### Customization

#### Update Knowledge Base
Edit `src/lib/knowledge-base.ts` to add more FAQs or update information.

#### Change Chatbot Appearance
Edit `src/components/ai-chatbot.tsx` to customize:
- Colors and styling
- Position (currently bottom-right)
- Size and dimensions
- Suggested questions

#### Update API Model
Change the `AI_MODEL` environment variable to use different models.

## 🔧 Configuration

### Environment Variables

```env
# Hugging Face (Recommended)
HUGGINGFACE_API_KEY="your-key"
HUGGINGFACE_API_URL="https://api-inference.huggingface.co/models"
AI_MODEL="mistralai/Mistral-7B-Instruct-v0.2"

# OR Ollama (Local)
OLLAMA_API_URL="http://localhost:11434/api/generate"
OLLAMA_MODEL="llama3.2"
```

### Customize Knowledge Base

Edit `src/lib/knowledge-base.ts`:

```typescript
export const churchKnowledgeBase = `
  // Add your custom FAQs and information here
`
```

## 🧪 Testing

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open any page**
   - Look for the chat button in the bottom-right
   - Click to open the chat

3. **Test Questions**
   - "When does service start?"
   - "How do I join the band?"
   - "Where are you located?"
   - "What are your service times?"

## 💡 Tips

### For Better Responses
1. Keep the knowledge base updated with current information
2. Use specific, clear questions
3. The chatbot learns from conversation history

### Performance
- Hugging Face free tier has rate limits
- Ollama runs locally (no limits, but requires server resources)
- Fallback mode works without API (simpler responses)

### Privacy
- Conversations are not stored in the database
- No personal data is collected
- All processing happens server-side

## 🐛 Troubleshooting

### Chatbot Not Appearing
- Check that `AIChatbot` is imported in `layout.tsx`
- Verify no JavaScript errors in console
- Ensure Tailwind CSS is properly configured

### API Errors
- Verify API key is correct
- Check Hugging Face model is available
- For Ollama, ensure it's running locally
- Check server logs for detailed errors

### Poor Responses
- Update the knowledge base with more information
- Try a different AI model
- Check that the prompt is correctly formatted

## 🔒 Security

- API keys are stored server-side only
- No user data is stored
- Rate limiting recommended for production
- Use environment variables for sensitive data

## 📊 Model Comparison

| Model | Provider | Speed | Quality | Cost |
|-------|----------|-------|---------|------|
| Mistral-7B | Hugging Face | Fast | High | Free tier available |
| Llama-3.2-3B | Hugging Face | Very Fast | Good | Free tier available |
| Llama 3.2 (Ollama) | Local | Fast | High | Free (self-hosted) |

## ✅ Next Steps

1. Choose your AI provider (Hugging Face recommended)
2. Add API key to environment variables
3. Test the chatbot on your website
4. Customize the knowledge base with your church information
5. Update suggested questions based on common inquiries

---

**Note:** The chatbot uses open-source AI models and is completely free to use. No proprietary services or paid APIs required!

