import { post, downloadFile, ApiResponse } from './api';
import { Template } from './templateApi';

// Generation request interface
export interface GenerationRequest {
  templateId: number;
  rowCount?: number;
  outputFormat?: 'CSV' | 'JSON' | 'XML';
  filename?: string;
}

/**
 * Generate data based on a template
 * This returns the raw data instead of downloading it
 */
export async function generateData(request: GenerationRequest): Promise<ApiResponse<Blob>> {
  const response = await fetch(`/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If error response isn't JSON, use status text
    }

    return {
      error: errorMessage,
      status: response.status,
    };
  }

  const blob = await response.blob();
  return {
    data: blob,
    status: response.status,
  };
}

/**
 * Generate and download data based on a template
 */
export async function downloadGeneratedData(request: GenerationRequest): Promise<boolean> {
  const format = request.outputFormat?.toLowerCase() || 'csv';
  const filename = `${request.filename || 'generated_data'}.${format}`;
  
  const params: Record<string, string> = {
    templateId: request.templateId.toString(),
  };
  
  if (request.rowCount) {
    params.rowCount = request.rowCount.toString();
  }
  
  if (request.outputFormat) {
    params.format = request.outputFormat;
  }
  
  return downloadFile(`/generate/${request.templateId}`, filename, params);
}

/**
 * Generate data preview
 * Returns first few rows of generated data for preview purposes
 */
export async function generateDataPreview(
  templateId: number,
  rowCount: number = 5,
  outputFormat: 'CSV' | 'JSON' | 'XML' = 'CSV'
): Promise<ApiResponse<string>> {
  return post<string>('/generate/preview', {
    templateId,
    rowCount,
    outputFormat
  });
}
