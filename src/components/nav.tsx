import { Mail, Settings, HelpCircle, RotateCcw } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Template {
  id: string
  name: string
  file: string
  description: string
}

interface NavProps {
  selectedTemplate: string
  onTemplateChange: (template: string) => void
  onResetTemplate: () => void
  apiUrl: string
  onApiUrlChange: (url: string) => void
  authHeader: string
  onAuthHeaderChange: (header: string) => void
}

export function Nav({ selectedTemplate, onTemplateChange, onResetTemplate, apiUrl, onApiUrlChange, authHeader, onAuthHeaderChange }: NavProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl)
  const [tempAuthHeader, setTempAuthHeader] = useState(authHeader)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/templates/templates.json')
        const templateData = await response.json()
        setTemplates(templateData)
      } catch (error) {
        console.error('Failed to load templates:', error)
        // Fallback to hardcoded templates
        setTemplates([
          { id: 'welcome-email', name: 'Welcome Email', file: 'welcome-email.hbs', description: 'Welcome email template' }
        ])
      }
    }

    loadTemplates()
  }, [])

  // Sync temp values when the actual values change
  useEffect(() => {
    setTempApiUrl(apiUrl)
  }, [apiUrl])

  useEffect(() => {
    setTempAuthHeader(authHeader)
  }, [authHeader])

  const handleSaveSettings = () => {
    onApiUrlChange(tempApiUrl)
    onAuthHeaderChange(tempAuthHeader)
    setSettingsOpen(false)
  }

  const handleCancelSettings = () => {
    setTempApiUrl(apiUrl)
    setTempAuthHeader(authHeader)
    setSettingsOpen(false)
  }

  return (
    <nav className="border-b border-border/50 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="flex h-14 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-foreground/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-foreground/80" />
          </div>
          <h1 className="text-sm font-medium text-foreground/90">Email Dev Environment</h1>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <button className="px-3 py-1.5 text-xs text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors rounded-md flex items-center gap-1.5">
                <Settings className="h-3 w-3" />
                Settings
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Choose your email template.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground mb-4">Email Template</label>
                    <Select value={selectedTemplate} onValueChange={onTemplateChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border/10 space-y-2">
                    <label className="text-sm font-medium text-foreground">Template Data</label>
                    <button 
                      onClick={() => {
                        onResetTemplate()
                        setSettingsOpen(false)
                      }}
                      className="w-full px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md border border-input bg-background transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset to Default
                    </button>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border/10 space-y-2">
                    <label className="text-sm font-medium text-foreground">API Configuration</label>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Report API URL</label>
                        <Input
                          value={tempApiUrl}
                          onChange={(e) => setTempApiUrl(e.target.value)}
                          placeholder="http://localhost:3000/dublin/send-automated-report-email"
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Authorization Header</label>
                        <Input
                          value={tempAuthHeader}
                          onChange={(e) => setTempAuthHeader(e.target.value)}
                          placeholder="Bearer your-token-here"
                          className="text-xs"
                        />
                        <p className="text-xs text-muted-foreground/70">
                          Optional. Include full header value (e.g., "Bearer token123")
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border/20">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancelSettings}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSaveSettings}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
            <DialogTrigger asChild>
              <button className="px-3 py-1.5 text-xs text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors rounded-md flex items-center gap-1.5">
                <HelpCircle className="h-3 w-3" />
                Help
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>How to Use Email Dev Environment</DialogTitle>
                <DialogDescription>
                  Learn how to create and preview email templates with dynamic data.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 relative">
                <div className="max-h-96 overflow-y-auto pr-2 scroll-smooth snap-y snap-mandatory">
                  <div className="space-y-6 text-sm">
                    <div className="snap-start">
                      <h3 className="font-medium text-foreground mb-3">Getting Started</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        This app helps you design and test email templates using Handlebars syntax. You can preview how your emails will look with real data before sending them.
                      </p>
                    </div>
                    
                    <div className="snap-start">
                      <h3 className="font-medium text-foreground mb-3">Using JSON Data</h3>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        Enter JSON data in the left panel to populate your email template. For example:
                      </p>
                      <pre className="bg-muted/50 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "firstName": "John",
  "companyName": "Your Company", 
  "plan": "Pro",
  "features": [
    "Advanced analytics",
    "Priority support"
  ]
}`}
                      </pre>
                    </div>
                    
                    <div className="snap-start">
                      <h3 className="font-medium text-foreground mb-3">Template Selection</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Use the Settings button to switch between different email templates. Each template has its own sample data and design.
                      </p>
                    </div>
                    
                    <div className="snap-start">
                      <h3 className="font-medium text-foreground mb-3">Preview Modes</h3>
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        Use the toggle buttons in the right panel to switch between:
                      </p>
                      <ul className="space-y-1 text-muted-foreground text-xs ml-4">
                        <li>• <strong>Preview</strong> - Live rendered email</li>
                        <li>• <strong>HTML</strong> - Generated HTML source</li>
                        <li>• <strong>Template</strong> - Raw Handlebars code</li>
                      </ul>
                    </div>
                    
                    <div className="snap-start">
                      <h3 className="font-medium text-foreground mb-3">Adding New Templates</h3>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        To add your own email template:
                      </p>
                      <ol className="space-y-2 text-muted-foreground text-xs ml-4">
                        <li>1. Create a new <code className="bg-muted/50 px-1 rounded">.hbs</code> file in <code className="bg-muted/50 px-1 rounded">public/templates/</code></li>
                        <li>2. Update <code className="bg-muted/50 px-1 rounded">public/templates/templates.json</code> with your template info:</li>
                      </ol>
                      <pre className="bg-muted/50 p-3 rounded text-xs font-mono overflow-x-auto mt-2 mb-3">
{`{
  "id": "my-template",
  "name": "My Template", 
  "file": "my-template.hbs",
  "description": "Custom template description"
}`}
                      </pre>
                      <p className="text-muted-foreground text-xs">
                        3. Add matching sample data in <code className="bg-muted/50 px-1 rounded">TemplateViewer.tsx</code> getDefaultData function
                      </p>
                    </div>
                    
                    <div className="snap-start">
                      <h3 className="font-medium text-foreground mb-3">Importing from AWS SES</h3>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        You can import templates directly from AWS Simple Email Service:
                      </p>
                      <pre className="bg-muted/50 p-3 rounded text-xs font-mono overflow-x-auto">
{`aws sesv2 get-email-template \\
  --template-name <TEMPLATE_NAME> \\
  | jq -r '.TemplateContent.Html'`}
                      </pre>
                      <p className="text-muted-foreground text-xs mt-2">
                        Replace <code className="bg-muted/50 px-1 rounded">&lt;TEMPLATE_NAME&gt;</code> with your actual SES template name.
                      </p>
                    </div>
                    
                    <div className="snap-start">
                      <h3 className="font-medium text-foreground mb-3">Resetting Templates</h3>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        Use the "Reset to Default" button in Settings to restore a template's original sample data:
                      </p>
                      <ul className="space-y-1 text-muted-foreground text-xs ml-4">
                        <li>• Clears your custom JSON data from browser storage</li>
                        <li>• Loads the template's default sample content (if available)</li>
                        <li>• Shows an empty textarea for templates without default data</li>
                        <li>• Helpful for starting fresh or seeing original examples</li>
                      </ul>
                    </div>
                    
                    <div className="snap-start">
                      <h3 className="font-medium text-foreground mb-3">Pro Tips</h3>
                      <ul className="space-y-1 text-muted-foreground text-xs">
                        <li>• Templates use Handlebars syntax like <code className="bg-muted/50 px-1 rounded">{"{{firstName}}"}</code></li>
                        <li>• Your JSON data will override the default sample data</li>
                        <li>• Invalid JSON will fall back to sample data</li>
                        <li>• Use arrays in JSON for repeating content like lists</li>
                        <li>• Data persists automatically - no need to save manually</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-16 left-0 right-2 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
                
                <div className="flex justify-end pt-4 mt-4 border-t border-border/20">
                  <button 
                    onClick={() => setHelpOpen(false)}
                    className="px-4 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-md transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  )
}