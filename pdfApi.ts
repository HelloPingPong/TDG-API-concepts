import { uploadFile, ApiResponse } from './api';
import { Template } from './templateApi';

/**
 * Upload and analyze a PDF to extract variables and create a template
 */
export async function analyzePdf(file: File): Promise<ApiResponse<Template>> {
  return uploadFile<Template>('/pdf/analyze', file);
}

/**
 * Interface for PDF analysis progress updates
 */
export interface PDFAnalysisProgress {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  currentStep: number;
  totalSteps: number;
  stepName: string;
  message?: string;
  progress: number; // 0-100
}

/**
 * Check status of PDF analysis process
 */
export async function checkAnalysisStatus(analysisId: string): Promise<ApiResponse<PDFAnalysisProgress>> {
  try {
    const response = await fetch(`/api/pdf/status/${analysisId}`, {
      method: 'GET',
      credentials: 'include',
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
    
    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('Error checking PDF analysis status:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * Interface for extracted variable from PDF
 */
export interface ExtractedVariable {
  name: string;
  originalName: string;
  type: string;
  confidence: number; // 0-1
  occurrences: number;
  possibleTypes: string[];
}

/**
 * Get extracted variables from a PDF
 */
export async function getExtractedVariables(analysisId: string): Promise<ApiResponse<ExtractedVariable[]>> {
  try {
    const response = await fetch(`/api/pdf/variables/${analysisId}`, {
      method: 'GET',
      credentials: 'include',
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
    
    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('Error getting extracted variables:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}
