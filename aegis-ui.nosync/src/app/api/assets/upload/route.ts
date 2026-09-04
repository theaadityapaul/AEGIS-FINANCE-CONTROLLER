import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'aegis-secret-key';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('aegis_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const body = await req.json();
    const { fileName, fileType, mimeType, sizeBytes, googleDriveFileId } = body;

    // Save asset record linked to the authenticated user in Neon
    const newAsset = await prisma.cloudAsset.create({
      data: {
        fileName,
        fileType,
        mimeType,
        sizeBytes: Number(sizeBytes) || 1024,
        googleDriveFileId: googleDriveFileId || `local_${Date.now()}`,
        userId: decoded.userId,
      },
    });

    return NextResponse.json({ success: true, asset: newAsset });
  } catch (error) {
    console.error('Asset upload error:', error);
    return NextResponse.json({ error: 'Failed to register asset' }, { status: 500 });
  }
}