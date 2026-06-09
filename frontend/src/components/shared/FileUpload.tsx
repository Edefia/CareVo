import * as React from "react"
import { UploadCloud, X, File as FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  accept?: string
  maxSizeMB?: number
}

export function FileUpload({
  onUpload,
  maxFiles = 5,
  accept = ".pdf,.png,.jpg,.jpeg",
  maxSizeMB = 10,
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = function (e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = function (e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValidSize = file.size / 1024 / 1024 <= maxSizeMB
      // basic accept check
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      const isValidType = accept.includes(ext) || accept.includes(file.type)
      return isValidSize && isValidType
    })

    const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles)
    setSelectedFiles(newFiles)
    onUpload(newFiles)
  }

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)
    onUpload(newFiles)
  }

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 bg-muted/10 hover:bg-muted/20"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground mb-1">
          <span className="text-primary font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          {accept.replace(/,/g, ", ")} (max {maxSizeMB}MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={handleChange}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 text-sm border rounded-md bg-card"
            >
              <div className="flex items-center space-x-2 truncate">
                <FileIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(i)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
