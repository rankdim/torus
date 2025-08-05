export class Patterns {
    static getPatterns() {
        return {
            glider: [
                [0, 1, 0],
                [0, 0, 1],
                [1, 1, 1]
            ],
            oscillator: [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 0]
            ],
            pulsar: [
                [0,0,1,1,1,0,0,0,1,1,1,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,1,0,1,0,0,0,0,1],
                [1,0,0,0,0,1,0,1,0,0,0,0,1],
                [1,0,0,0,0,1,0,1,0,0,0,0,1],
                [0,0,1,1,1,0,0,0,1,1,1,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,1,1,1,0,0,0,1,1,1,0,0],
                [1,0,0,0,0,1,0,1,0,0,0,0,1],
                [1,0,0,0,0,1,0,1,0,0,0,0,1],
                [1,0,0,0,0,1,0,1,0,0,0,0,1],
                [0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,1,1,1,0,0,0,1,1,1,0,0]
            ],
            spaceship: [
                [1,0,0,1,0],
                [0,0,0,0,1],
                [1,0,0,0,1],
                [0,1,1,1,1]
            ]
        };
    }
    
    static loadPattern(gameLogic, patternName) {
        const patterns = this.getPatterns();
        const pattern = patterns[patternName];
        if (!pattern) return;
        
        gameLogic.clearGrid();
        
        const instances = patternName === 'glider' ? 8 : patternName === 'pulsar' ? 1 : 4;
        
        for (let inst = 0; inst < instances; inst++) {
            const startI = Math.floor(Math.random() * (gameLogic.GRID_HEIGHT - pattern.length));
            const startJ = Math.floor(Math.random() * (gameLogic.GRID_WIDTH - pattern[0].length));
            
            gameLogic.placePattern(pattern, startI, startJ);
        }
        
        gameLogic.generation = 0;
    }
}