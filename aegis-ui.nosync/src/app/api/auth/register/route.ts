import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'aegis-secret-key';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if operator already exists in Neon
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Operator account already exists' }, { status: 400 });
    }

    // Hash the password securely before storing permanently
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Store the new operator permanently in Neon DB
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'OPERATOR',
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const response = NextResponse.json({ success: true, role: newUser.role });
    response.cookies.set({
      name: 'aegis_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}