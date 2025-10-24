import { useState, useEffect, useRef } from 'react'
import Handlebars from 'handlebars'
import { Eye, Code, FileText, Database } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface TemplateViewerProps {
  jsonData?: string
  selectedTemplate?: string
}

export function TemplateViewer({ jsonData, selectedTemplate = 'welcome-email' }: TemplateViewerProps) {
  const [template, setTemplate] = useState('')
  const [renderedHtml, setRenderedHtml] = useState('')
  const [viewMode, setViewMode] = useState<'preview' | 'source' | 'template' | 'structure'>('preview')
  const [error, setError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Default sample data for different templates
  const getDefaultData = (templateId: string) => {
    const commonData = {
      companyName: "Acme Corporation",
      firstName: "Sarah",
      supportEmail: "support@acme.com",
      address: "123 Business Ave, Tech City, TC 12345",
      unsubscribeUrl: "https://example.com/unsubscribe",
      preferencesUrl: "https://example.com/preferences"
    }

    if (templateId === 'newsletter') {
      return {
        ...commonData,
        newsletterTitle: "Tech Weekly",
        issueNumber: "42",
        issueDate: "March 15, 2024",
        period: "weekly",
        articles: [
          {
            category: "Technology",
            title: "The Future of AI in Web Development",
            excerpt: "Discover how artificial intelligence is transforming the way we build and design websites. From automated code generation to intelligent user experiences.",
            readTime: "5",
            url: "https://example.com/ai-web-dev"
          },
          {
            category: "Tutorial",
            title: "Building Responsive Emails with Modern CSS",
            excerpt: "Learn the latest techniques for creating emails that look great on any device. We'll cover flexbox, grid, and media queries for email.",
            readTime: "8",
            url: "https://example.com/responsive-emails"
          }
        ],
        stats: {
          newUsers: "2.5K",
          articles: "12",
          engagement: "94"
        },
        quickLinks: [
          { title: "Browse All Articles", url: "https://example.com/articles" },
          { title: "Community Forum", url: "https://example.com/forum" },
          { title: "Developer Tools", url: "https://example.com/tools" }
        ],
        socialLinks: {
          twitter: "https://twitter.com/acme",
          linkedin: "https://linkedin.com/company/acme",
          facebook: "https://facebook.com/acme"
        }
      }
    }

    // Default for welcome-email and fallback
    return {
      ...commonData,
      isFirstTime: true,
      userCount: "50,000+",
      templateCount: "200+",
      satisfaction: "98",
      plan: "Premium",
      ctaUrl: "https://example.com/get-started",
      features: [
        "Unlimited email templates",
        "Advanced analytics dashboard",
        "Priority customer support",
        "Custom branding options",
        "API access for integrations"
      ]
    }
  }

  // Parse Handlebars template to extract structure
  const parseTemplateStructure = (templateContent: string): string => {
    interface StructureNode {
      [key: string]: StructureNode | string | StructureNode[]
    }

    const structure: StructureNode = {}

    // Regex patterns for different Handlebars expressions
    const patterns = {
      variable: /\{\{(?!#|\/|\^|!)([\w\.\[\]]+)\}\}/g,
      each: /\{\{#each\s+([\w\.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      if: /\{\{#if\s+([\w\.]+)\}\}/g,
      unless: /\{\{#unless\s+([\w\.]+)\}\}/g,
      with: /\{\{#with\s+([\w\.]+)\}\}/g
    }

    // Helper function to set nested object property
    const setNestedProperty = (obj: StructureNode, path: string, value: any) => {
      const keys = path.split('.')
      let current = obj

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!(key in current)) {
          current[key] = {}
        }
        current = current[key] as StructureNode
      }

      const lastKey = keys[keys.length - 1]
      if (!(lastKey in current)) {
        current[lastKey] = value
      }
    }

    // Extract each loops (arrays)
    let match
    while ((match = patterns.each.exec(templateContent)) !== null) {
      const arrayPath = match[1]
      const loopContent = match[2]

      // Parse the content inside the each loop
      const itemStructure: StructureNode = {}
      const varMatches = loopContent.matchAll(/\{\{(?!#|\/|\^|!)this\.([\w\.]+)\}\}/g)

      for (const varMatch of varMatches) {
        setNestedProperty(itemStructure, varMatch[1], 'string')
      }

      // Also check for direct {{this}} usage
      if (loopContent.includes('{{this}}')) {
        setNestedProperty(structure, arrayPath, ['string'])
      } else {
        setNestedProperty(structure, arrayPath, [itemStructure])
      }
    }

    // Extract regular variables
    patterns.variable.lastIndex = 0
    while ((match = patterns.variable.exec(templateContent)) !== null) {
      const path = match[1]

      // Skip 'this' references (handled by each loops)
      if (path.startsWith('this.') || path === 'this') continue

      // Determine type based on context
      let type = 'string'

      // Check if used in conditional context
      const ifRegex = new RegExp(`\\{\\{#(?:if|unless)\\s+${path.replace(/\./g, '\\.')}\\}\\}`)
      if (ifRegex.test(templateContent)) {
        type = 'boolean'
      }

      setNestedProperty(structure, path, type)
    }

    // Extract if/unless conditions
    patterns.if.lastIndex = 0
    while ((match = patterns.if.exec(templateContent)) !== null) {
      const path = match[1]
      if (!path.startsWith('this.')) {
        setNestedProperty(structure, path, 'boolean')
      }
    }

    patterns.unless.lastIndex = 0
    while ((match = patterns.unless.exec(templateContent)) !== null) {
      const path = match[1]
      if (!path.startsWith('this.')) {
        setNestedProperty(structure, path, 'boolean')
      }
    }

    // Generate TypeScript interface
    const generateInterface = (obj: any, interfaceName: string = 'TemplateData', indent: string = ''): string => {
      let result = `${indent}interface ${interfaceName} {\n`

      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === 'object') {
            result += `${indent}  ${key}: {\n`
            for (const [subKey, subValue] of Object.entries(value[0] as any)) {
              result += `${indent}    ${subKey}: ${subValue};\n`
            }
            result += `${indent}  }[];\n`
          } else {
            result += `${indent}  ${key}: ${typeof value[0] === 'string' ? value[0] : 'any'}[];\n`
          }
        } else if (typeof value === 'object' && value !== null) {
          result += `${indent}  ${key}: {\n`
          for (const [subKey, subValue] of Object.entries(value as any)) {
            const subType = Array.isArray(subValue)
              ? (typeof subValue[0] === 'object' ? 'object[]' : `${typeof subValue[0]}[]`)
              : typeof subValue === 'object' ? 'object' : subValue
            result += `${indent}    ${subKey}: ${subType};\n`
          }
          result += `${indent}  };\n`
        } else {
          result += `${indent}  ${key}: ${value};\n`
        }
      }

      result += `${indent}}`
      return result
    }

    return generateInterface(structure)
  }

  useEffect(() => {
    // Load the template from the templates directory
    const loadTemplate = async () => {
      try {
        // First, load templates.json to get the correct filename
        const templatesResponse = await fetch('/templates/templates.json')
        const templates = await templatesResponse.json()
        const templateConfig = templates.find((t: any) => t.id === selectedTemplate)
        
        if (!templateConfig) {
          setError(`Template "${selectedTemplate}" not found`)
          return
        }

        // Load the actual template file using the filename from config
        const response = await fetch(`/templates/${templateConfig.file}`)
        const templateContent = await response.text()
        setTemplate(templateContent)
        setError(null)
      } catch (err) {
        setError('Failed to load template: ' + (err as Error).message)
      }
    }

    loadTemplate()
  }, [selectedTemplate])

  useEffect(() => {
    if (template) {
      try {
        let data = getDefaultData(selectedTemplate)

        // Try to use JSON data from props if available
        if (jsonData && jsonData.trim()) {
          try {
            const parsedData = JSON.parse(jsonData)
            data = { ...data, ...parsedData }
          } catch (e) {
            // Fall back to default data if JSON is invalid
            data = getDefaultData(selectedTemplate)
          }
        }

        const compiledTemplate = Handlebars.compile(template)
        const rendered = compiledTemplate(data)
        setRenderedHtml(rendered)
        setError(null)
      } catch (err) {
        setError('Failed to render template: ' + (err as Error).message)
      }
    }
  }, [template, jsonData, selectedTemplate])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log('entry', entry.contentRect.width)
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])



  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6 flex-shrink-0">
          <h2 className="text-sm font-medium text-foreground mb-1">Email Template</h2>
          <p className="text-xs text-muted-foreground">
            Preview your handlebars email template
          </p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex-1">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-medium text-foreground mb-1">Email Template</h2>
            <p className="text-xs text-muted-foreground">
              {viewMode === 'preview' && 'Live preview of your email template'}
              {viewMode === 'source' && 'Rendered HTML source code'}
              {viewMode === 'template' && 'Raw handlebars template'}
              {viewMode === 'structure' && 'TypeScript interface derived from template'}
            </p>
          </div>
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preview">
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  Preview
                </div>
              </SelectItem>
              <SelectItem value="source">
                <div className="flex items-center gap-2">
                  <Code className="h-3 w-3" />
                  HTML
                </div>
              </SelectItem>
              <SelectItem value="template">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Template
                </div>
              </SelectItem>
              <SelectItem value="structure">
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  Structure
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-background flex-1 flex flex-col overflow-hidden">
        {viewMode === 'preview' && (
          <div className="flex-1 w-full overflow-hidden rounded-lg bg-foreground/2">
            <iframe
              srcDoc={renderedHtml}
              className="w-full h-full border-0 rounded-lg"
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        )}

        {viewMode === 'source' && (
          <div className="flex-1 overflow-auto bg-foreground/2 shadow-inner rounded-lg">
            <SyntaxHighlighter
              language="html"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '16px',
                background: 'transparent',
                fontSize: '12px',
                lineHeight: '1.5'
              }}
              wrapLongLines={true}
            >
              {renderedHtml}
            </SyntaxHighlighter>
          </div>
        )}

        {viewMode === 'template' && (
          <div className="flex-1 overflow-auto bg-foreground/2 shadow-inner rounded-lg">
            <SyntaxHighlighter
              language="html"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '16px',
                background: 'transparent',
                fontSize: '12px',
                lineHeight: '1.5'
              }}
              wrapLongLines={true}
            >
              {template}
            </SyntaxHighlighter>
          </div>
        )}

        {viewMode === 'structure' && (
          <div className="flex-1 overflow-auto bg-foreground/2 shadow-inner rounded-lg">
            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-xs font-medium text-foreground mb-1">TypeScript Interface</h3>
                <p className="text-xs text-muted-foreground">
                  Generated from Handlebars template variables
                </p>
              </div>
              <SyntaxHighlighter
                language="typescript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: 'transparent',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  borderRadius: '6px',
                  border: '1px solid hsl(var(--border) / 0.3)'
                }}
                wrapLongLines={true}
              >
                {template ? parseTemplateStructure(template) : 'interface TemplateData {\n  // No template loaded\n}'}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
