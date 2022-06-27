class Controls {
  constructor(player, map) {

    document.onkeydown = function (event) {
      switch (event.code) {
        case "ArrowUp": 
          player.moveX = 1; 
          player.moveY = 1; 
          break;         
        case "ArrowDown": 
          player.moveX = -1; 
          player.moveY = -1; 
          break;       
        case "ArrowLeft": 
          player.moveAngle = 1; 
          break;                      
        case "ArrowRight": 
          player.moveAngle = -1; 
          break;                     
        case "ShiftRight": 
          map.showMini(); 
          break;                          
      }
    }

    document.onkeyup = function (event) {
      switch (event.code) {
        case "ArrowUp":
        case "ArrowDown": 
          player.moveX = 0; 
          player.moveY = 0; 
          break;
        case "ArrowLeft":
        case "ArrowRight": 
          player.moveAngle = 0; 
          break;
        case "ShiftRight": 
          map.hideMini(); 
          break;
      }
    }
  }
}

export { Controls };