import { NextResponse } from "next/server";

// Base response types
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

// Helper function to create success response
export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

// Helper function to create error response
export function errorResponse(
  error: string,
  status: number = 500,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    },
    { status }
  );
}
