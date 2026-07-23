import { pb } from './pb.js'

export async function createArtifact(sessionId, type, name, content, mimeType = 'text/plain') {
  return await pb.createArtifact({ sessionId, type, name, content, mimeType })
}

export async function getArtifact(id) {
  return await pb.getArtifact(id)
}

export async function listArtifacts(sessionId) {
  return await pb.getArtifacts(sessionId)
}

export async function deleteArtifact(id) {
  return await pb.deleteArtifact(id)
}
