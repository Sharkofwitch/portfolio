import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { uploadPhoto, deletePhoto } from '@/lib/nextcloud';
import prisma from '@/lib/prisma';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/photos - Start');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (session?.user?.role !== 'admin') {
      console.log('Unauthorized - No valid admin session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    console.log('Received file:', file?.name);
    
    // Extract metadata from form
    const metadata = {
      title: formData.get('title') as string,
      alt: formData.get('alt') as string,
      year: formData.get('year') as string || undefined,
      location: formData.get('location') as string || undefined,
      camera: formData.get('camera') as string || undefined,
      description: formData.get('description') as string || undefined,
    };
    console.log('Metadata:', metadata);

    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!metadata.title || !metadata.alt) {
      console.log('Missing required metadata');
      return NextResponse.json({ error: 'Title and alt text are required' }, { status: 400 });
    }

    // Generate a unique filename
    const uniqueName = `${Date.now()}-${metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${path.extname(file.name)}`;
    const src = `/photos/${uniqueName}`;
    console.log('Generated src:', src);
    
    // Upload to Nextcloud
    console.log('Uploading to Nextcloud...');
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadPhoto(buffer, uniqueName);
    console.log('Upload successful');

    // Save to database with default dimensions
    console.log('Saving to database...');
    const photo = await prisma.photo.create({
      data: {
        src,
        title: metadata.title,
        alt: metadata.alt,
        width: 1600, // default width
        height: 1067, // default height
        year: metadata.year,
        location: metadata.location,
        camera: metadata.camera,
        description: metadata.description,
      }
    });
    console.log('Database save successful:', photo);

    return NextResponse.json({ 
      success: true, 
      photo
    });
  } catch (error) {
    console.error('Error handling photo upload:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      photos
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
    }

    // Extract metadata from form
    const metadata = {
      title: formData.get('title') as string,
      alt: formData.get('alt') as string,
      year: formData.get('year') as string || undefined,
      location: formData.get('location') as string || undefined,
      camera: formData.get('camera') as string || undefined,
      description: formData.get('description') as string || undefined,
    };

    if (!metadata.title || !metadata.alt) {
      return NextResponse.json({ error: 'Title and alt text are required' }, { status: 400 });
    }

    // Update in database
    const photo = await prisma.photo.update({
      where: { id },
      data: metadata
    });

    return NextResponse.json({ 
      success: true, 
      photo
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
    }

    // Get the photo to delete
    const photo = await prisma.photo.findUnique({
      where: { id }
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Get the filename from the src path
    const filename = path.basename(photo.src);

    // Delete from both Nextcloud and database
    await Promise.all([
      deletePhoto(filename),
      prisma.photo.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 500 });
  }
}
