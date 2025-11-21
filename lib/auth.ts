import bcrypt from 'bcryptjs'
import { JWTPayload, UserRole } from './types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key') {
  console.warn('⚠️  ATTENTION: Utilisez un JWT_SECRET sécurisé en production!')
}

// Hacher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

// Vérifier un mot de passe
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Créer un JWT token (version simple sans librairie externe)
export function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const tokenPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 jours
  }

  // Encoder en Base64URL
  const base64UrlEncode = (obj: any): string => {
    const json = JSON.stringify(obj)
    return Buffer.from(json)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const headerEncoded = base64UrlEncode(header)
  const payloadEncoded = base64UrlEncode(tokenPayload)

  // Créer la signature
  const crypto = require('crypto')
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${headerEncoded}.${payloadEncoded}.${signature}`
}

// Vérifier et décoder un JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [headerEncoded, payloadEncoded, signature] = parts

    // Vérifier la signature
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    if (signature !== expectedSignature) {
      console.error('Signature JWT invalide')
      return null
    }

    // Décoder le payload
    const base64UrlDecode = (str: string): string => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
      const pad = base64.length % 4
      if (pad) {
        base64 += '='.repeat(4 - pad)
      }
      return Buffer.from(base64, 'base64').toString('utf-8')
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadEncoded))

    // Vérifier l'expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error('Token JWT expiré')
      return null
    }

    return payload
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error)
    return null
  }
}

// Extraire le token du header Authorization
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// Middleware pour vérifier l'authentification
export function authenticateRequest(
  authHeader: string | null
): { valid: boolean; payload?: JWTPayload; error?: string } {
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return { valid: false, error: 'Token manquant' }
  }

  const payload = verifyToken(token)

  if (!payload) {
    return { valid: false, error: 'Token invalide ou expiré' }
  }

  return { valid: true, payload }
}

// Vérifier si l'utilisateur a le bon rôle
export function checkRole(
  payload: JWTPayload | undefined,
  requiredRole: UserRole
): boolean {
  return payload?.role === requiredRole
}
