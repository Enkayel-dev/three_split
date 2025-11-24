/**
 * WebSocket bridge to communicate with the React Three Fiber app
 */

import WebSocket from 'ws'

export interface SceneObject {
  id: string
  type: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  properties: Record<string, unknown>
  parentNode: string
  visible: boolean
}

export interface SceneSnapshot {
  camera: {
    position: [number, number, number]
    lookAt: [number, number, number]
  }
  currentNode: string
  isTransitioning: boolean
  objects: SceneObject[]
}

export interface BridgeMessage {
  type: string
  payload?: unknown
  requestId?: string
}

export class SceneBridge {
  private ws: WebSocket | null = null
  private url: string
  private pendingRequests: Map<string, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
  }> = new Map()
  private requestIdCounter = 0
  private connected = false
  private cachedSnapshot: SceneSnapshot | null = null

  constructor(url: string) {
    this.url = url
  }

  private async ensureConnection(): Promise<void> {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url)

      this.ws.on('open', () => {
        this.connected = true
        resolve()
      })

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as BridgeMessage
          this.handleMessage(message)
        } catch (e) {
          console.error('Failed to parse message:', e)
        }
      })

      this.ws.on('close', () => {
        this.connected = false
      })

      this.ws.on('error', (error) => {
        this.connected = false
        reject(error)
      })

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'))
        }
      }, 5000)
    })
  }

  private handleMessage(message: BridgeMessage): void {
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const pending = this.pendingRequests.get(message.requestId)!
      this.pendingRequests.delete(message.requestId)

      if (message.type === 'error') {
        pending.reject(new Error(message.payload as string))
      } else {
        pending.resolve(message.payload)
      }
    }

    // Handle broadcast updates
    if (message.type === 'snapshot_update') {
      this.cachedSnapshot = message.payload as SceneSnapshot
    }
  }

  private async sendRequest<T>(type: string, payload?: unknown): Promise<T> {
    await this.ensureConnection()

    const requestId = `req_${++this.requestIdCounter}`

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, {
        resolve: resolve as (value: unknown) => void,
        reject,
      })

      this.ws!.send(
        JSON.stringify({
          type,
          payload,
          requestId,
        })
      )

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId)
          reject(new Error('Request timeout'))
        }
      }, 10000)
    })
  }

  // Public API methods

  async getSnapshot(): Promise<SceneSnapshot> {
    try {
      return await this.sendRequest<SceneSnapshot>('get_snapshot')
    } catch {
      // Return mock data if not connected (for development)
      return this.getMockSnapshot()
    }
  }

  async listObjects(filter?: { node?: string; type?: string }): Promise<SceneObject[]> {
    try {
      return await this.sendRequest<SceneObject[]>('list_objects', filter)
    } catch {
      return []
    }
  }

  async getObject(objectId: string): Promise<SceneObject | null> {
    try {
      return await this.sendRequest<SceneObject>('get_object', { objectId })
    } catch {
      return null
    }
  }

  async createObject(params: {
    type: string
    position: [number, number, number]
    rotation?: [number, number, number]
    scale?: [number, number, number]
    properties?: Record<string, unknown>
    parentNode?: string
  }): Promise<{ success: boolean; objectId?: string; message: string }> {
    return await this.sendRequest('create_object', params)
  }

  async editObject(params: {
    objectId: string
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: [number, number, number]
    properties?: Record<string, unknown>
    visible?: boolean
  }): Promise<{ success: boolean; message: string }> {
    return await this.sendRequest('edit_object', params)
  }

  async deleteObject(objectId: string): Promise<{ success: boolean; message: string }> {
    return await this.sendRequest('delete_object', { objectId })
  }

  async navigateTo(params: {
    node?: string
    position?: [number, number, number]
    lookAt?: [number, number, number]
  }): Promise<{ success: boolean; message: string }> {
    return await this.sendRequest('navigate_to', params)
  }

  async setMaterial(params: {
    objectId: string
    preset?: string
    transmission?: number
    roughness?: number
    color?: string
  }): Promise<{ success: boolean; message: string }> {
    return await this.sendRequest('set_material', params)
  }

  // New animation control methods

  async getRegisteredObjects(filter?: { node?: string; type?: string }): Promise<unknown[]> {
    try {
      return await this.sendRequest<unknown[]>('get_registered_objects', filter)
    } catch {
      return this.getMockRegisteredObjects()
    }
  }

  async getAnimationState(objectId: string): Promise<unknown> {
    return await this.sendRequest('get_animation_state', { objectId })
  }

  async setAnimationState(objectId: string, state: {
    hovered?: boolean
    pressed?: boolean
    loading?: boolean
    disabled?: boolean
  }): Promise<{ success: boolean; message: string }> {
    return await this.sendRequest('set_animation_state', { objectId, state })
  }

  async getMaterialParams(objectId: string): Promise<unknown> {
    return await this.sendRequest('get_material_params', { objectId })
  }

  async setMaterialParams(objectId: string, params: {
    transmission?: number
    roughness?: number
    ior?: number
    emissiveIntensity?: number
    color?: string
    envMapIntensity?: number
    clearcoat?: number
  }): Promise<{ success: boolean; message: string }> {
    return await this.sendRequest('set_material_params', { objectId, params })
  }

  async triggerAnimation(
    objectId: string,
    animation: string,
    params?: Record<string, unknown>
  ): Promise<{ success: boolean; message: string }> {
    return await this.sendRequest('trigger_animation', { objectId, animation, params })
  }

  async listAnimations(objectId?: string, type?: string): Promise<{ animations: string[] }> {
    return await this.sendRequest('list_animations', { objectId, type })
  }

  private getMockRegisteredObjects(): unknown[] {
    return [
      {
        id: 'glassbutton_1',
        type: 'GlassButton',
        name: 'Get Started',
        position: [0, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        parentNode: 'home',
        visible: true,
        properties: { label: 'Get Started', variant: 'primary', size: 'md' },
        animationState: { hovered: false, pressed: false, loading: false, disabled: false },
        materialState: { transmission: 0.85, roughness: 0.08, ior: 1.5 },
      },
    ]
  }

  private getMockSnapshot(): SceneSnapshot {
    return {
      camera: {
        position: [0, 1.5, 4],
        lookAt: [0, 1.2, 0],
      },
      currentNode: 'home',
      isTransitioning: false,
      objects: [
        {
          id: 'hero_panel',
          type: 'GlassPanel',
          position: [0, 1.2, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          properties: { width: 2.0, height: 1.2 },
          parentNode: 'home',
          visible: true,
        },
        {
          id: 'nav_consulting',
          type: 'GlassCard',
          position: [-1.5, 0.8, -1.2],
          rotation: [0, 0.2, 0],
          scale: [1, 1, 1],
          properties: { title: 'Consulting', subtitle: 'Streamline operations' },
          parentNode: 'home',
          visible: true,
        },
        {
          id: 'nav_software',
          type: 'GlassCard',
          position: [0, 0.8, -1.2],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          properties: { title: 'Software', subtitle: 'Build custom tools' },
          parentNode: 'home',
          visible: true,
        },
        {
          id: 'nav_construction',
          type: 'GlassCard',
          position: [1.5, 0.8, -1.2],
          rotation: [0, -0.2, 0],
          scale: [1, 1, 1],
          properties: { title: 'Construction', subtitle: 'Design spaces' },
          parentNode: 'home',
          visible: true,
        },
      ],
    }
  }
}
