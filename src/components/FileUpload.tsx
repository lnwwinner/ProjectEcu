import React, { useCallback } from 'react';
import { Upload, FileType, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  error: string | null;
  success: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isUploading, error, success }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  return (
    <div 
      className="w-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <label 
        htmlFor="ecu-upload"
        className={`
          relative flex flex-col items-center justify-center w-full h-48 
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200
          ${success ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900'}
          ${error ? 'border-red-500/50 bg-red-500/5' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="mb-3"
            >
              <Upload className="w-10 h-10 text-zinc-500" />
            </motion.div>
          ) : success ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
          ) : (
            <Upload className="w-10 h-10 text-zinc-500 mb-3" />
          )}
          
          <p className="mb-2 text-sm text-zinc-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-zinc-500 font-mono">.BIN, .ORI, .MOD (MAX. 16MB)</p>
        </div>
        
        <input 
          id="ecu-upload" 
          type="file" 
          className="hidden" 
          accept=".bin,.ori,.mod"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
    </div>
  );
};
