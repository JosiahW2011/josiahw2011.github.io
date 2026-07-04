import * as three from './three.module.js';

// Implement the basic texture file for each block.
const textureLoader = new three.TextureLoader();
const textureAtlas = textureLoader.load(window.GameAssets.textureAtlas);
textureAtlas.magFilter = three.NearestFilter;
textureAtlas.minFilter = three.NearestFilter;

export class Chunk {
    constructor(scene, three, width, height, depth) {
        this.scene = scene;
        this.three = three;
        
        this.width = width;
        this.height = height;
        this.depth = depth;
        
        this.chunkData = new Uint8Array(this.width * this.height * this.depth);
        this.generateTerrain();
        
        this.mesh = this.generateMesh();
        this.scene.add(this.mesh);
    }

    // Get block from position Vector3(X, Y, Z)
    getBlock(x, y, z) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) return 0;
        return this.chunkData[x + y * this.width + z * this.width * this.height];
    }

	// Change a block type at (X, Y, Z) and trigger a mesh rebuild
	setBlock(x, y, z, blockId) {
    	if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) return;

    	const index = x + y * this.width + z * this.width * this.height;
    	this.chunkData[index] = blockId;

    	this.scene.remove(this.mesh);
    	this.mesh.geometry.dispose();
		
    	this.mesh = this.generateMesh();
    	this.scene.add(this.mesh);
	}

	exportToString() {
		const dimensionsHeader = `${this.width},${this.height},${this.depth}`;
		const rawData = this.chunkData.toString();
		return `${dimensionsHeader}|${rawData}`;
	}

	importFromString(textData) {
		const sections = textData.split('|');
		if (sections.length !== 2) {
			console.error("Invalid save format!");
			return;
		}
		
		const headerStr = sections[0];
		const dataStr = sections[1];
		
		const [newWidth, newHeight, newDepth] = headerStr.split(',').map(num => parseInt(num, 10));

		this.width = newWidth;
		this.height = newHeight;
		this.depth = newDepth;

		const stringArray = dataStr.split(',');
		const expectedLength = this.width * this.height * this.depth;

		if (stringArray.length !== expectedLength) {
			alert("Save file data mismatch! Expected" + expectedLength + " entries for a" + this.width + "x" + this.height + "x" + this.depth + " world, but got" + stringArray.length + "!");
			return;
		}

		this.chunkData = new Uint8Array(expectedLength);
		
		for (let i = 0; i < this.chunkData.length; i++) {
			this.chunkData[i] = parseInt(stringArray[i], 10);
		}

		this.scene.remove(this.mesh);
		this.mesh.geometry.dispose();

		this.mesh = this.generateMesh();
		this.scene.add(this.mesh);
	}

    generateTerrain() {
        for (let x=0; x<this.width; x++) {
            for (let z=0; z<this.depth; z++) {
                for (let y=0; y<this.height; y++) {
                    const index = x + (y * this.width) + (z * this.width * this.height);
                    const groundHeight = 7;

                    if (y > groundHeight) {
                        this.chunkData[index] = 0; // Air
                    } else if (y === groundHeight) {
                        this.chunkData[index] = 3; // Grass
                    } else if (y < groundHeight && y >= groundHeight - 2) {
                        this.chunkData[index] = 2; // Dirt
                    } else {
                        this.chunkData[index] = 1; // Stone
                   	}
                }
            }
        }
    }

    isTransparent(x, y, z) {
        const blockId = this.getBlock(x, y, z);
        return blockId === 0 || blockId === 6;
    }

    generateMesh() {
		// Solid blocks only. ;)
        const solidPositions = [];
        const solidIndices = [];
        const solidUvs = [];
        let solidVertexCount = 0;

		// For transparent blocks like glass.
		const transPositions = [];
        const transIndices = [];
        const transUvs = [];
        let transVertexCount = 0;

        const pushUVs = (uvArray, uMin, uMax, vMin, vMax) => {
            const topV = 1.0 - vMin;
            const botV = 1.0 - vMax;
            uvArray.push(
                uMin, topV,
                uMax, topV,
                uMin, botV,
                uMax, botV
            );
        };

        const applyFaceTexture = (uvArray, blockId, faceDirection) => {
            if (blockId === 1) {
                pushUVs(uvArray, 0.25, 0.5, 0.25, 0.5); // Stone
            } else if (blockId === 2) {
                pushUVs(uvArray, 0.25, 0.5, 0.0, 0.25); // Dirt
            } else if (blockId === 3) {
                if (faceDirection === 'top') {
                    pushUVs(uvArray, 0.0, 0.25, 0.0, 0.25); // Grass Top
                } else if (faceDirection === 'bottom') {
                    pushUVs(uvArray, 0.25, 0.5, 0.0, 0.25); // Dirt Bottom
                } else {
                    pushUVs(uvArray, 0.0, 0.25, 0.25, 0.5); // Grass Side
                }
            } else if (blockId === 4) {
				pushUVs(uvArray, 0.25, 0.0, 0.5, 0.75); // Oak Plank
			} else if (uvArray, blockId === 5) {
				pushUVs(uvArray, 0.25, 0.5, 0.5, 0.75); // Bricks
			} else if (blockId === 6) {
				pushUVs(uvArray, 0.25, 0.0, 0.75, 1.0); // Glass
			}
        };

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                for (let z = 0; z < this.depth; z++) {
                    const blockId = this.getBlock(x, y, z);
                    if (blockId === 0) continue; // Skip air blocks entirely

					const isGlass = (blockId === 6);
					const p = isGlass ? transPositions : solidPositions;
					const i = isGlass ? transIndices : solidIndices;
					const u = isGlass ? transUvs : solidUvs;

					const checkFace = (nx, ny, nz) => {
						const neighborId = this.getBlock(nx, ny, nz);
						if (isGlass && neighborId === 6) return false;
						return this.isTransparent(nx, ny, nz);
					};

                    // 1. TOP FACE (Y + 1)
                    if (checkFace(x, y + 1, z)) {
                        let vc = isGlass ? transVertexCount : solidVertexCount;
                        p.push(x, y + 1, z + 1,  x + 1, y + 1, z + 1,  x, y + 1, z,  x + 1, y + 1, z);
                        applyFaceTexture(u, blockId, 'top');
                        i.push(vc, vc + 1, vc + 2, vc + 2, vc + 1, vc + 3);
                        if (isGlass) transVertexCount += 4; else solidVertexCount += 4;
                    }

                    // 2. BOTTOM FACE (Y - 1)
                    if (checkFace(x, y - 1, z)) {
                        let vc = isGlass ? transVertexCount : solidVertexCount;
                        p.push(x, y, z,  x + 1, y, z,  x, y, z + 1,  x + 1, y, z + 1);
                        applyFaceTexture(u, blockId, 'bottom');
                        i.push(vc, vc + 1, vc + 2, vc + 2, vc + 1, vc + 3);
                        if (isGlass) transVertexCount += 4; else solidVertexCount += 4;
                    }

                    // 3. FRONT FACE (Z + 1)
                    if (checkFace(x, y, z + 1)) {
                        let vc = isGlass ? transVertexCount : solidVertexCount;
                        p.push(x, y, z + 1,  x + 1, y, z + 1,  x, y + 1, z + 1,  x + 1, y + 1, z + 1);
                        applyFaceTexture(u, blockId, 'side');
                        i.push(vc, vc + 1, vc + 2, vc + 2, vc + 1, vc + 3);
                        if (isGlass) transVertexCount += 4; else solidVertexCount += 4;
                    }

                    // 4. BACK FACE (Z - 1)
                    if (checkFace(x, y, z - 1)) {
                        let vc = isGlass ? transVertexCount : solidVertexCount;
                        p.push(x + 1, y, z,  x, y, z,  x + 1, y + 1, z,  x, y + 1, z);
                        applyFaceTexture(u, blockId, 'side');
                        i.push(vc, vc + 1, vc + 2, vc + 2, vc + 1, vc + 3);
                        if (isGlass) transVertexCount += 4; else solidVertexCount += 4;
                    }

                    // 5. RIGHT FACE (X + 1)
                    if (checkFace(x + 1, y, z)) {
                        let vc = isGlass ? transVertexCount : solidVertexCount;
                        p.push(x + 1, y, z + 1,  x + 1, y, z,  x + 1, y + 1, z + 1,  x + 1, y + 1, z);
                        applyFaceTexture(u, blockId, 'side');
                        i.push(vc, vc + 1, vc + 2, vc + 2, vc + 1, vc + 3);
                        if (isGlass) transVertexCount += 4; else solidVertexCount += 4;
                    }

                    // 6. LEFT FACE (X - 1)
                    if (checkFace(x - 1, y, z)) {
                        let vc = isGlass ? transVertexCount : solidVertexCount;
                        p.push(x, y, z,  x, y, z + 1,  x, y + 1, z,  x, y + 1, z + 1);
                        applyFaceTexture(u, blockId, 'side');
                        i.push(vc, vc + 1, vc + 2, vc + 2, vc + 1, vc + 3);
                        if (isGlass) transVertexCount += 4; else solidVertexCount += 4;
                    }
                }
            }
        }

        const geometry = new this.three.BufferGeometry();

		const combinedPositions = solidPositions.concat(transPositions);
		const combinedUVs = solidUvs.concat(transUvs);

		const offsetTransIndices = transIndices.map(idx => idx + solidVertexCount);
		const combinedIndices = solidIndices.concat(offsetTransIndices);

        geometry.setAttribute('position', new this.three.Float32BufferAttribute(combinedPositions, 3));
        geometry.setAttribute('uv', new this.three.Float32BufferAttribute(combinedPositions.length ? combinedUVs : [], 2));
        geometry.setIndex(combinedIndices);
    
        geometry.clearGroups();
		if (solidIndices.length > 0) {
			geometry.addGroup(0, solidIndices.length, 0);
		}
		if (transIndices.length > 0) {
			geometry.addGroup(solidIndices.length, transIndices.length, 1);
		}

		geometry.computeVertexNormals();
    
		const solidMaterial = new this.three.MeshStandardMaterial({
            map: textureAtlas,
            transparent: false,
            side: this.three.DoubleSide
        });

        const glassMaterial = new this.three.MeshStandardMaterial({
            map: textureAtlas,
            transparent: true,
            opacity: 1.0, 
            alphaTest: 0.1,
            side: this.three.FrontSide
        });

		const mesh = new this.three.Mesh(geometry, [solidMaterial, glassMaterial]);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
        return mesh;
    }
}
