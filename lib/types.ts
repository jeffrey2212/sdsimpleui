export interface CategoryOption {
  id: string
  label: string
  category: string
}

export interface Keyword extends CategoryOption {}

export interface Category {
  id: string
  label: string
  description: string
}

export interface GeneratedImage {
  imageUrl: string
  prompt: string
  timestamp: number
}

