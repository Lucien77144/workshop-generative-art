import { MeshStandardMaterial, MeshToonMaterial } from 'three'

export default class StemMaterial extends MeshToonMaterial {
    static materials = []

    static update() {
        StemMaterial.materials.forEach((material) => {
            material.update()
        })
    }

    /**
     *
     * @param {import('three').MeshBasicMaterialParameters} params
     */
    constructor(params, time) {
        super({
            ...params,
        })
        this.time = time
        StemMaterial.materials.push(this)
    }

    /**
     *
     * @param {import('three').Shader} shaders
     * @param {import('three').WebGLRenderer} renderer
     */
    onBeforeCompile(shader, renderer) {
        super.onBeforeCompile(shader, renderer)

        shader.uniforms.uProgress = { value: 0 }

        /**
         * VERTEX
         */

        shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            [
                'varying vec2 vUv;',
                'void main() {',
                '   vUv = uv;',
            ].join('\n')
        )

        /**
         * FRAGMENT
         */
        shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            [
                'uniform float uProgress;',
                'varying vec2 vUv;',
                'void main() {',
            ].join('\n')
        )

        // Discard
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            [
                '#include <map_fragment>',
                'vec2 uv = vUv;',
                '   float isVisible = step(uProgress, uv.x);',
                'if(isVisible == 1.) {',
                '     discard;',
                '};',
                'diffuseColor.rgb = vec3(0.376,0.757,0.373) * 0.9;',
            ].join('\n')
        )

        this.userData.shader = shader
    }

    update() {
        if (this.userData && this.userData.shader) {
            let progress = this.userData.shader.uniforms.uProgress.value + 0.005
            progress = Math.min(progress, 1)
            this.userData.shader.uniforms.uProgress.value = progress
        }
    }
}
