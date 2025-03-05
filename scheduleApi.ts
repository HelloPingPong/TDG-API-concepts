import { get, post, put, del, ApiResponse } from './api';

// Schedule interfaces
export interface GenerationSchedule {
  id?: number;
  name: string;
  description?: string;
  templateId: number;
  status?: 'CREATED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ERROR';
  nextRunTime?: string;
  cronExpression?: string;
  rowCount: number;
  outputFormat: 'CSV' | 'JSON' | 'XML';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastRunTime?: string;
  lastRunResult?: string;
}

export interface ScheduleListParams {
  page?: number;
  size?: number;
  sort?: string;
  status?: string;
}

export interface ScheduleListResponse {
  content: GenerationSchedule[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Get all schedules with pagination
 */
export async function getSchedules(
  params: ScheduleListParams = {}
): Promise<ApiResponse<ScheduleListResponse>> {
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
  
  if (params.status) {
    queryParams.status = params.status;
  }
  
  return get<ScheduleListResponse>('/schedules', queryParams);
}

/**
 * Get a schedule by ID
 */
export async function getScheduleById(id: number): Promise<ApiResponse<GenerationSchedule>> {
  return get<GenerationSchedule>(`/schedules/${id}`);
}

/**
 * Create a new schedule
 */
export async function createSchedule(schedule: GenerationSchedule): Promise<ApiResponse<GenerationSchedule>> {
  return post<GenerationSchedule>('/schedules', schedule);
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(
  id: number, 
  schedule: GenerationSchedule
): Promise<ApiResponse<GenerationSchedule>> {
  return put<GenerationSchedule>(`/schedules/${id}`, schedule);
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(id: number): Promise<ApiResponse<void>> {
  return del(`/schedules/${id}`);
}

/**
 * Get schedules for a template
 */
export async function getSchedulesForTemplate(
  templateId: number
): Promise<ApiResponse<GenerationSchedule[]>> {
  return get<GenerationSchedule[]>(`/schedules/byTemplate/${templateId}`);
}

/**
 * Get schedules by status
 */
export async function getSchedulesByStatus(
  status: string
): Promise<ApiResponse<GenerationSchedule[]>> {
  return get<GenerationSchedule[]>(`/schedules/byStatus/${status}`);
}

/**
 * Activate a schedule
 */
export async function activateSchedule(id: number): Promise<ApiResponse<GenerationSchedule>> {
  return post<GenerationSchedule>(`/schedules/${id}/activate`);
}

/**
 * Pause a schedule
 */
export async function pauseSchedule(id: number): Promise<ApiResponse<GenerationSchedule>> {
  return post<GenerationSchedule>(`/schedules/${id}/pause`);
}

/**
 * Execute a schedule immediately
 */
export async function executeScheduleNow(id: number): Promise<ApiResponse<void>> {
  return post<void>(`/schedules/${id}/execute`);
}

/**
 * Get next execution times for a cron expression
 */
export async function getNextExecutionTimes(
  cronExpression: string,
  count: number = 5
): Promise<ApiResponse<string[]>> {
  return get<string[]>('/schedules/nextExecutions', {
    cronExpression,
    count: count.toString()
  });
}
