const fs = require('fs');
const file = 'e:/SOL/components/admin/dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Feature Settings</h2>
              <p className="text-muted-foreground">
                Control which features are visible on your portfolio website.
              </p>
            </div>

            <div className="space-y-4">
              {/* Video Editor - Convert to 9:16 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Maximize2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="videoEditor" className="text-base font-semibold cursor-pointer">
                          Convert to 9:16 (Video Editor)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Convert videos to YouTube Shorts format at /video-editor
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="videoEditor"
                      checked={settings?.videoEditorEnabled || false}
                      onCheckedChange={() => handleToggleSetting('videoEditorEnabled', settings?.videoEditorEnabled || false)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Video Trim Feature */}


              {/* Placeholder for future features */}
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">More feature settings coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}`;

const replacement = `        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">Platform Feature & Tool Settings</h2>
              <p className="text-sm text-muted-foreground">
                Activate or deactivate platform tools and cutting-edge specialist PDF features in real time.
              </p>
            </div>

            {/* SECTION 1: Groundbreaking Specialist PDF Innovations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Specialist PDF Editor Innovations (Industry First)</span>
              </div>

              {/* 1. True Word Processor Text Reflow */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-rose-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfTextReflow" className="text-base font-semibold cursor-pointer">
                          1. True "Word Processor" Text Reflow Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allows fluid paragraph text reflow that naturally pushes surrounding content down like a Google Doc.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfTextReflow"
                      checked={settings?.pdfTextReflowEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfTextReflowEnabled', settings?.pdfTextReflowEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 2. Bulk Highlights Extraction */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                        <Highlighter className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfBulkHighlights" className="text-base font-semibold cursor-pointer">
                          2. Bulk Extraction of Highlights & Study Guide
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          1-click copy all marked highlights across the entire PDF or export as study guide notes.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfBulkHighlights"
                      checked={settings?.pdfBulkHighlightsEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfBulkHighlightsEnabled', settings?.pdfBulkHighlightsEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 3. Advanced Typography Controls */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                        <Sliders className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfAdvancedTypography" className="text-base font-semibold cursor-pointer">
                          3. Advanced Typography (Kerning, Tracking & Leading)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Fine-grained letter tracking and line-height controls to seamlessly match original designer metrics.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfAdvancedTypography"
                      checked={settings?.pdfAdvancedTypographyEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfAdvancedTypographyEnabled', settings?.pdfAdvancedTypographyEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 4. Smart Multi-Object Editing & Alignment */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Maximize2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfMultiObjectAlignment" className="text-base font-semibold cursor-pointer">
                          4. Smart Multi-Object Alignment & Snap-to-Grid
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Multi-select annotations, snap-to-grid guidelines, and 1-click horizontal/vertical alignment.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfMultiObjectAlignment"
                      checked={settings?.pdfMultiObjectAlignmentEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfMultiObjectAlignmentEnabled', settings?.pdfMultiObjectAlignmentEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 5. Native Reference Manager & Citation Generator */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                        <Bookmark className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfReferenceManager" className="text-base font-semibold cursor-pointer">
                          5. Academic Citation Generator & Zotero/BibTeX Export
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Built-in APA/MLA/Chicago citation injector and bibliography sync with external reference managers.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfReferenceManager"
                      checked={settings?.pdfReferenceManagerEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfReferenceManagerEnabled', settings?.pdfReferenceManagerEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 6. Dynamic PDF-to-Mind-Map Conversion */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfMindMap" className="text-base font-semibold cursor-pointer">
                          6. Dynamic PDF-to-Mind-Map Visual Converter
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically transforms long document sections and headings into an interactive concept tree map.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfMindMap"
                      checked={settings?.pdfMindMapEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfMindMapEnabled', settings?.pdfMindMapEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SECTION 2: Document & Media Tools Management */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Document & Media Utilities</span>
              </div>

              {/* PDF Editor Suite */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                        <PenTool className="h-5 w-5 text-rose-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfEditor" className="text-base font-semibold cursor-pointer">
                          Online PDF Editor Suite
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/pdf-editor (text annotations, digital signatures, stamps, redaction)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfEditor"
                      checked={settings?.pdfEditorEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfEditorEnabled', settings?.pdfEditorEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Word to PDF */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="wordToPdf" className="text-base font-semibold cursor-pointer">
                          Word to PDF Converter (.docx to .pdf)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/word-to-pdf conversion tool
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="wordToPdf"
                      checked={settings?.wordToPdfEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('wordToPdfEnabled', settings?.wordToPdfEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PDF to Word */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfToWord" className="text-base font-semibold cursor-pointer">
                          PDF to Word Converter (.pdf to .docx)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/pdf-to-word conversion tool
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfToWord"
                      checked={settings?.pdfToWordEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfToWordEnabled', settings?.pdfToWordEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Word Editor */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="wordEditor" className="text-base font-semibold cursor-pointer">
                          Online Word & Document Editor
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/word-editor (WYSIWYG document processor with templates)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="wordEditor"
                      checked={settings?.wordEditorEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('wordEditorEnabled', settings?.wordEditorEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image Editor */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="imageEditor" className="text-base font-semibold cursor-pointer">
                          Professional Canvas Image Studio
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/image-editor (crop, rotate, filters, brush, eyedropper, social presets)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="imageEditor"
                      checked={settings?.imageEditorEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('imageEditorEnabled', settings?.imageEditorEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Video Editor */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Video className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="videoEditor" className="text-base font-semibold cursor-pointer">
                          Convert to 9:16 (Video Editor)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable video conversion at /video-editor
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="videoEditor"
                      checked={settings?.videoEditorEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('videoEditorEnabled', settings?.videoEditorEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const newContent = normContent.replace(normTarget, replacement);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('SUCCESS: Dashboard settings tab updated!');
} else {
  console.log('Target not found.');
}

