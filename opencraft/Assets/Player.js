import * as three from './three.module.js'
import { Timer } from './Timer.js';

export class Player {
    constructor (camera, controls) {
        this.camera = camera;
        this.controls = controls;
        
        this.moveSpeed = 8.0;
        this.jumpForce = 9.0;
        this.gravity = 30.0;

        this.velocity = new three.Vector3();
        this.canJump = true;
        this.playerHeight = 1.4;
        this.playerRadius = 0.3;
        this.playerBox = new three.Box3();

        this.timer = new three.Timer();
        
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        this.initInput();
    }

    initInput() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': this.keys.forward = true; break;
                case 'KeyA': this.keys.left = true; break;
                case 'KeyS': this.keys.backward = true; break;
                case 'KeyD': this.keys.right = true; break;
                case 'Space':
                    if (this.canJump) {
                        this.velocity.y = this.jumpForce;
                        this.canJump = false;
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW': this.keys.forward = false; break;
                case 'KeyA': this.keys.left = false; break;
                case 'KeyS': this.keys.backward = false; break;
                case 'KeyD': this.keys.right = false; break;
            }
        });
    }

    update(spawnChunk) {
        this.timer.update();
        const delta = this.timer.getDelta();
        if (delta > 0.1) return;

        if (this.controls.isLocked) {
            
            const isCollidingAt = (pos) => {
                if (!spawnChunk || typeof spawnChunk.getBlock !== 'function') return false;

                const minX = Math.floor(pos.x - this.playerRadius);
                const maxX = Math.floor(pos.x + this.playerRadius);
                const minY = Math.floor(pos.y - this.playerHeight);
                const maxY = Math.floor(pos.y);
                const minZ = Math.floor(pos.z - this.playerRadius);
                const maxZ = Math.floor(pos.z + this.playerRadius);

                for (let x = minX; x <= maxX; x++) {
                    for (let y = minY; y <= maxY; y++) {
                        for (let z = minZ; z <= maxZ; z++) {
                            if (x < 0 || x >= spawnChunk.width || 
                                y < 0 || 
                                z < 0 || z >= spawnChunk.depth) {
                                return true; 
                            }

                            const blockType = spawnChunk.getBlock(x, y, z);
                            if (blockType !== 0 && blockType !== undefined && blockType !== null) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            };

            const distance = this.moveSpeed * delta;

            this.velocity.y -= this.gravity * delta;
            this.camera.position.y += this.velocity.y * delta;

            if (isCollidingAt(this.camera.position)) {
                if (this.velocity.y < 0) {
                    this.camera.position.y = Math.ceil(this.camera.position.y - this.playerHeight) + this.playerHeight;
                    this.velocity.y = 0;
                    this.canJump = true;
                } else if (this.velocity.y > 0) {
                    this.camera.position.y = Math.floor(this.camera.position.y);
                    this.velocity.y = 0;
                }
            }

            if (this.camera.position.y < 0) {
                this.camera.position.y = 10;
                this.velocity.y = 0;
            }

            let oldPosition = this.camera.position.clone();

            if (this.keys.right) {
                this.controls.moveRight(distance);
                if (isCollidingAt(this.camera.position)) this.camera.position.copy(oldPosition);
                else oldPosition.copy(this.camera.position); 
            }

            if (this.keys.left) {
                this.controls.moveRight(-distance);
                if (isCollidingAt(this.camera.position)) this.camera.position.copy(oldPosition);
                else oldPosition.copy(this.camera.position);
            }

            if (this.keys.forward) {
                this.controls.moveForward(distance);
                if (isCollidingAt(this.camera.position)) this.camera.position.copy(oldPosition);
                else oldPosition.copy(this.camera.position);
            }

            if (this.keys.backward) {
                this.controls.moveForward(-distance);
                if (isCollidingAt(this.camera.position)) this.camera.position.copy(oldPosition);
                else oldPosition.copy(this.camera.position);
            }
        }
    }
}