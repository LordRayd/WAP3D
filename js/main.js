let player
let inputEventManager

/** TODO */
$(function() {
  player = new wap3D()
  inputEventManager = new IEM(player)
  updateEventListener()
})

/** TODO */
function updateEventListener() {
  $(document).on("keydown", event => inputEventManager.keydownAction(event))
  $(document).on("keyup", event => inputEventManager.keyupAction(event))

  $("#closeOpenButton").one("click", event => inputEventManager.closeObjectListAction(event))

  $("#play").on("click", event => inputEventManager.clickOnPlayAction(event))
  $("#replay").on("click", event => inputEventManager.clickOnReplayAction(event))
  $("#time-slider").on("change", event => inputEventManager.advanceTimeBar(event))

  $(window).on("resize", event => inputEventManager.updateRendererSize(event))
}