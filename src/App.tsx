import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Wand2, Sparkles, Copy, Check } from 'lucide-react'
import { blink } from './blink/client'
import { toast } from 'react-hot-toast'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  size: string
  quality: string
  timestamp: number
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [quality, setQuality] = useState('standard')
  const [style, setStyle] = useState('natural')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt!')
      return
    }

    setIsGenerating(true)
    try {
      const result = await blink.ai.generateImage({
        prompt: prompt.trim(),
        size: size as '1024x1024' | '1024x1792' | '1792x1024',
        quality: quality as 'standard' | 'hd',
        style: style as 'natural' | 'vivid',
        n: 1
      })

      if (result.data && result.data.length > 0) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: result.data[0].url,
          prompt: prompt.trim(),
          size,
          quality,
          timestamp: Date.now()
        }
        
        setGeneratedImages(prev => [newImage, ...prev])
        toast.success('Image generated successfully!')
      }
    } catch {
      toast.error('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      toast.success('URL copied to clipboard!')
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url, { mode: "cors" })
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `ai-image-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('Image downloaded!')
    } catch {
      toast.error('Failed to download image')
    }
  }

  const examplePrompts = [
    "A futuristic city with neon lights and flying cars",
    "A magical forest with glowing mushrooms and fairy lights",
    "A majestic dragon soaring through clouds at sunset",
    "A cozy coffee shop on a rainy day with warm lighting",
    "A space station orbiting a distant planet",
    "A vintage robot playing chess in a library"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Image Generator
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your ideas into stunning visuals with the power of artificial intelligence. 
            Create unique artwork, illustrations, and designs from simple text descriptions.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Create Your Image
                </CardTitle>
                <CardDescription>
                  Describe what you want to generate and customize the settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="prompt" className="text-sm font-medium">
                    Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe your image in detail..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-sm font-medium">Image Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                        <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
                        <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality" className="text-sm font-medium">Quality</Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="hd">HD Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style" className="text-sm font-medium">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="vivid">Vivid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {/* Example Prompts */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Try these examples:</Label>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
                        onClick={() => setPrompt(example)}
                      >
                        {example.length > 30 ? `${example.slice(0, 30)}...` : example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Images */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Generated Images</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {generatedImages.length === 0 
                  ? "Your generated images will appear here"
                  : `${generatedImages.length} image${generatedImages.length > 1 ? 's' : ''} generated`
                }
              </p>
            </div>

            {generatedImages.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-24 h-24 mb-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                    <Wand2 className="w-12 h-12 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Ready to create amazing images?
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                    Enter a prompt and click "Generate Image" to create your first AI-generated artwork.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map((image) => (
                  <Card key={image.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <img 
                        src={image.url} 
                        alt={image.prompt}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(image.url, image.prompt)}
                            className="bg-white/90 hover:bg-white text-gray-900"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopyUrl(image.url)}
                            className="bg-white/90 hover:bg-white text-gray-900"
                          >
                            {copiedUrl === image.url ? (
                              <Check className="w-4 h-4 mr-1" />
                            ) : (
                              <Copy className="w-4 h-4 mr-1" />
                            )}
                            Copy URL
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        {image.prompt}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {image.size}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {image.quality}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {new Date(image.timestamp).toLocaleString()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App