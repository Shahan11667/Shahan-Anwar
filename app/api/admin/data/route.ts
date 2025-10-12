import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// This is a protected route - requires valid JWT token
export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    // Check if token exists
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'No token provided. Please login first.',
        },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied. Admin role required.',
        },
        { status: 403 }
      );
    }

    // Return protected data
    return NextResponse.json(
      {
        success: true,
        message: 'Admin data fetched successfully',
        data: {
          user: {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
          },
          adminData: {
            totalUsers: 150,
            totalProjects: 25,
            totalMessages: 500,
            serverStatus: 'Online',
            lastUpdated: new Date().toISOString(),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching admin data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

