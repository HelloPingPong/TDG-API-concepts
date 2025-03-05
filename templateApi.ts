import { get, post, put, del, ApiResponse } from './api';

// Template interfaces
export interface ColumnDefinition {
  id?: number;
  name: string;
  type: string;
  sequenceNumber: number;
  isNullable: boolean;
  nullProbability: number;
  constraints: Record<string, any>;
}

export interface Template {
  id?: number;
  name: string;
  description: string;
  columnDefinitions: ColumnDefinition[];
  defaultOutputFormat: 'CSV' | 'JSON' | 'XML';
  defaultRowCount: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface TemplateListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface TemplateSearchParams {
  name?: string;
  columnType?: string;
}

export interface TemplateListResponse {
  content: Template[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DataType {
  type: string;
  displayName: string;
  category: string;
  description: string;
  constraintsMetadata: Record<string, string>;
}

/**
 * Get all templates with pagination
 */
export async function getTemplates(
  params: TemplateListParams = {}
): Promise<ApiResponse<TemplateListResponse>> {
  const queryParams: Record<string, string> = {};
  
  if (params.page !== undefined) {
    queryParams.page = params.page.toString();
  }
  
  if (params.size !== undefined) {
    queryParams.size = params.size.toString();
  }
  
  if (params.sort) {
    queryParams.sort = params.sort;
  }
  
  return get<TemplateListResponse>('/templates', queryParams);
}

/**
 * Get a template by ID
 */
export async function getTemplateById(id: number): Promise<ApiResponse<Template>> {
  return get<Template>(`/templates/${id}`);
}

/**
 * Create a new template
 */
export async function createTemplate(template: Template): Promise<ApiResponse<Template>> {
  return post<Template>('/templates', template);
}

/**
 * Update an existing template
 */
export async function updateTemplate(id: number, template: Template): Promise<ApiResponse<Template>> {
  return put<Template>(`/templates/${id}`, template);
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: number): Promise<ApiResponse<void>> {
  return del(`/templates/${id}`);
}

/**
 * Search templates by name
 */
export async function searchTemplates(
  searchTerm: string
): Promise<ApiResponse<Template[]>> {
  return get<Template[]>('/templates/search', { name: searchTerm });
}

/**
 * Get available data types and their metadata
 */
export async function getDataTypes(): Promise<ApiResponse<Record<string, DataType>>> {
  return get<Record<string, DataType>>('/templates/datatypes');
}
