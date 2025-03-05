import { post, ApiResponse } from './api';

// Batch generation interfaces
export interface BatchGenerationRequest {
  templateIds: number[];
  rowCount?: number;
  outputFormat?: 'CSV' | 'JSON' | 'XML';
  parallel?: boolean;
}

export interface BatchGenerationResult {
  templateId: number;
  templateName?: string;
  success: boolean;
  message: string;
  durationMillis: number;
  outputFormat?: 'CSV' | 'JSON' | 'XML';
  dataSize?: number;
  dataPreview?: string;
  downloadUrl?: string;
}

/**
 * Generate data for multiple templates in a batch
 */
export async function generateBatch(
  request: BatchGenerationRequest
): Promise<ApiResponse<BatchGenerationResult[]>> {
  return post<BatchGenerationResult[]>('/batch/generate', request);
}

/**
 * Download batch results as zip file
 */
export async function downloadBatchResults(batchId: string): Promise<boolean> {
  const filename = `batch_${batchId}.zip`;
  
  try {
    const response = await fetch(`/api/batch/download/${batchId}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error('Batch download failed:', error);
    return false;
  }
}
