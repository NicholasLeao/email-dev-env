import { useState, useEffect } from 'react'
import { AlertCircle, Code } from 'lucide-react'
import { Nav } from './components/nav'
import { TemplateViewer } from './components/TemplateViewer'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function App() {
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome-email')
  const [isInitialized, setIsInitialized] = useState(false)
  const [triggerInput, setTriggerInput] = useState('')
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/dublin/send-automated-report-email')
  const [authHeader, setAuthHeader] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setJsonError(null)
      return
    }
    
    try {
      JSON.parse(value)
      setJsonError(null)
    } catch (error) {
      if (error instanceof Error) {
        setJsonError(error.message)
      } else {
        setJsonError('Invalid JSON')
      }
    }
  }

  const resetTemplate = async () => {
    if (!selectedTemplate) return

    // Clear localStorage for current template
    const key = `email-dev-env:${selectedTemplate}`
    localStorage.removeItem(key)

    // Try to load default content
    try {
      const response = await fetch('/templates/templates.json')
      const templates = await response.json()
      const template = templates.find((t: any) => t.id === selectedTemplate)
      
      if (template?.defaultContent) {
        const defaultResponse = await fetch(`/templates/${template.defaultContent}`)
        const defaultContent = await defaultResponse.text()
        setJsonInput(defaultContent)
        validateJson(defaultContent)
      } else {
        setJsonInput('')
        setJsonError(null)
      }
    } catch (error) {
      console.error('Failed to load default content:', error)
      setJsonInput('')
      setJsonError(null)
    }
  }

  // Load API URL and Auth Header from localStorage on mount
  useEffect(() => {
    const savedApiUrl = localStorage.getItem('email-dev-env:apiUrl')
    const savedAuthHeader = localStorage.getItem('email-dev-env:authHeader')
    
    if (savedApiUrl) {
      setApiUrl(savedApiUrl)
    }
    if (savedAuthHeader) {
      setAuthHeader(savedAuthHeader)
    }
  }, [])

  // Save API URL to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('email-dev-env:apiUrl', apiUrl)
  }, [apiUrl])

  // Save Auth Header to localStorage when it changes
  useEffect(() => {
    if (authHeader.trim()) {
      localStorage.setItem('email-dev-env:authHeader', authHeader)
    } else {
      localStorage.removeItem('email-dev-env:authHeader')
    }
  }, [authHeader])

  useEffect(() => {
    // Initialize app with default template and its saved data
    const initializeApp = async () => {
      try {
        const response = await fetch('/templates/templates.json')
        const templates = await response.json()
        const defaultTemplate = templates.find((template: any) => template.default)
        const template = defaultTemplate || templates.find((t: any) => t.id === 'welcome-email')
        const templateId = template ? template.id : 'welcome-email'
        
        // Load saved data for the default template
        const key = `email-dev-env:${templateId}`
        const savedData = localStorage.getItem(key)
        
        // Set both template and data together to avoid race conditions
        setSelectedTemplate(templateId)
        
        if (savedData) {
          setJsonInput(savedData)
          validateJson(savedData)
        } else if (template?.defaultContent) {
          // Load default content if no saved data exists
          try {
            const defaultResponse = await fetch(`/templates/${template.defaultContent}`)
            const defaultContent = await defaultResponse.text()
            setJsonInput(defaultContent)
            validateJson(defaultContent)
          } catch (defaultError) {
            console.error('Failed to load default content:', defaultError)
            setJsonInput('')
            setJsonError(null)
          }
        } else {
          setJsonInput('')
          setJsonError(null)
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to load templates:', error)
        // Initialize with fallback
        setSelectedTemplate('welcome-email')
        const key = 'email-dev-env:welcome-email'
        const savedData = localStorage.getItem(key)
        if (savedData) {
          setJsonInput(savedData)
          validateJson(savedData)
        } else {
          setJsonInput('')
          setJsonError(null)
        }
        setIsInitialized(true)
      }
    }

    initializeApp()
  }, [])

  // Save JSON input to localStorage whenever it changes (only after initialization)
  useEffect(() => {
    if (isInitialized && selectedTemplate) {
      const key = `email-dev-env:${selectedTemplate}`
      if (jsonInput.trim()) {
        localStorage.setItem(key, jsonInput)
      } else {
        localStorage.removeItem(key)
      }
    }
  }, [jsonInput, selectedTemplate, isInitialized])

  // Load JSON data from localStorage when template changes (only after initialization)
  useEffect(() => {
    if (isInitialized && selectedTemplate) {
      const loadTemplateData = async () => {
        const key = `email-dev-env:${selectedTemplate}`
        const savedData = localStorage.getItem(key)
        
        if (savedData) {
          setJsonInput(savedData)
          validateJson(savedData)
        } else {
          // Try to load default content if no saved data
          try {
            const response = await fetch('/templates/templates.json')
            const templates = await response.json()
            const template = templates.find((t: any) => t.id === selectedTemplate)
            
            if (template?.defaultContent) {
              const defaultResponse = await fetch(`/templates/${template.defaultContent}`)
              const defaultContent = await defaultResponse.text()
              setJsonInput(defaultContent)
              validateJson(defaultContent)
            } else {
              setJsonInput('')
              setJsonError(null)
            }
          } catch (error) {
            console.error('Failed to load template data:', error)
            setJsonInput('')
            setJsonError(null)
          }
        }
      }
      
      loadTemplateData()
    }
  }, [selectedTemplate, isInitialized])

  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    validateJson(value)
  }

  const formatJson = () => {
    if (!jsonInput.trim()) return
    
    try {
      const parsed = JSON.parse(jsonInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonInput(formatted)
      setJsonError(null)
    } catch (error) {
      // If JSON is invalid, do nothing - the error is already shown
    }
  }

  const handleTriggerReport = async () => {
    if (!triggerInput.trim()) {
      setJsonError('Please enter a report ID')
      return
    }

    setIsLoading(true)
    setJsonError(null)

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Add Authorization header if configured
      if (authHeader.trim()) {
        headers['Authorization'] = authHeader.trim()
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          payload: {
            id: parseInt(triggerInput.trim())
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      
      // Extract .data.data from the response
      if (responseData?.data?.data) {
        const extractedData = JSON.stringify(responseData.data.data, null, 2)
        setJsonInput(extractedData)
        setJsonError(null)
        console.log('Report data loaded successfully')
      } else {
        throw new Error('Invalid response structure: .data.data not found')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch report data'
      setJsonError(`API Error: ${errorMessage}`)
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <Nav 
        selectedTemplate={selectedTemplate} 
        onTemplateChange={setSelectedTemplate} 
        onResetTemplate={resetTemplate}
        apiUrl={apiUrl}
        onApiUrlChange={setApiUrl}
        authHeader={authHeader}
        onAuthHeaderChange={setAuthHeader}
      />
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full bg-background flex flex-col">
            <div className="flex flex-col h-full p-6 overflow-hidden">
              <div className="mb-4 flex-shrink-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="trigger-report" className="bg-foreground/5 shadow-inner border rounded-lg">
                    <AccordionTrigger className="text-sm font-medium text-foreground px-4">
                      Trigger Report
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3 pt-2">
                        <div>
                          <label htmlFor="trigger-input" className="text-xs font-medium text-foreground mb-2 block">
                            Report ID
                          </label>
                          <Input
                            id="trigger-input"
                            type="number"
                            value={triggerInput}
                            onChange={(e) => setTriggerInput(e.target.value)}
                            placeholder="Enter report ID (e.g., 779)"
                            className="text-sm"
                            disabled={isLoading}
                          />
                        </div>
                        <Button 
                          onClick={handleTriggerReport}
                          size="sm"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Loading...' : 'Trigger'}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              <div className="mb-6 flex-shrink-0">
                <h2 className="text-sm font-medium text-foreground mb-1">JSON Data</h2>
                <p className="text-xs text-muted-foreground">
                  Enter your JSON data for the email template
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="relative flex-1">
                  {!isInitialized && (
                    <div className="absolute inset-0 rounded-lg border border-border/50 bg-foreground/2 shadow-inner p-4 flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin"></div>
                        <span className="text-sm">Loading...</span>
                      </div>
                    </div>
                  )}
                  <textarea
                    value={jsonInput}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    placeholder='{"name": "John Doe", "email": "john@example.com"}'
                    disabled={!isInitialized}
                    className="w-full h-full rounded-lg border border-border/50 bg-foreground/5 shadow-inner p-4 pr-12 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {isInitialized && jsonInput.trim() && !jsonError && (
                    <button
                      onClick={formatJson}
                      className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-background/90 backdrop-blur-sm border border-border/50 rounded-md hover:bg-accent transition-colors shadow-sm"
                      title="Format JSON"
                    >
                      <Code className="h-3 w-3" />
                      Format
                    </button>
                  )}
                </div>
                {jsonError && (
                  <div className="flex-shrink-0 rounded-md border border-red-400/50 bg-red-400/10 p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400/80 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-red-400/80">JSON Parse Error</p>
                      <p className="text-xs text-red-400/80 mt-1">{jsonError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full bg-card/20 flex flex-col">
            <div className="flex flex-col h-full p-6 overflow-hidden">
              <TemplateViewer jsonData={!jsonError ? jsonInput : undefined} selectedTemplate={selectedTemplate} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default App