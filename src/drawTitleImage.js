import { stdFontName } from './tools'

import { GaugeType } from './definitions'

const drawTitleImage = function (
  ctx,
  imageWidth,
  imageHeight,
  titleString,
  unitString,
  backgroundColor,
  vertical,
  radial,
  altPos,
  gaugeType
) {
  gaugeType =
    undefined === gaugeType ? (gaugeType = GaugeType.TYPE1) : gaugeType
  ctx.save()
  ctx.textAlign = radial ? 'center' : 'left'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor()
  ctx.fillStyle = backgroundColor.labelColor.getRgbaColor()

  if (radial) {
    ctx.font = 0.046728 * imageWidth + 'px ' + stdFontName
    ctx.fillText(
      titleString,
      imageWidth / 2,
      imageHeight * 0.3,
      imageWidth * 0.3
    )
    ctx.fillText(
      unitString,
      imageWidth / 2,
      imageHeight * 0.38,
      imageWidth * 0.3
    )
  } else {
    // linear
    if (vertical) {
      ctx.font = 0.1 * imageWidth + 'px ' + stdFontName
      ctx.save()
      ctx.translate(0.671428 * imageWidth, 0.1375 * imageHeight)
      ctx.rotate(1.570796)
      ctx.fillText(titleString, 0, 0)
      ctx.translate(-0.671428 * imageWidth, -0.1375 * imageHeight)
      ctx.restore()
      ctx.font = 0.071428 * imageWidth + 'px ' + stdFontName
      if (altPos) {
        // LCD visible
        if (gaugeType.type === 'type2') {
          ctx.textAlign = 'right'
          ctx.fillText(
            unitString,
            0.36 * imageWidth,
            imageHeight * 0.79,
            imageWidth * 0.25
          )
        } else {
          ctx.fillText(
            unitString,
            0.63 * imageWidth,
            imageHeight * 0.85,
            imageWidth * 0.2
          )
        }
      } else {
        // LCD hidden
        ctx.textAlign = 'center'
        if (gaugeType.type === 'type2') {
          ctx.fillText(
            unitString,
            imageWidth / 2,
            imageHeight * 0.92,
            imageWidth * 0.2
          )
        } else {
          ctx.fillText(
            unitString,
            imageWidth / 2,
            imageHeight * 0.89,
            imageWidth * 0.2
          )
        }
      }
    } else {
      // linear horizontal
      ctx.font = 0.035 * imageWidth + 'px ' + stdFontName
      ctx.fillText(
        titleString,
        imageWidth * 0.15,
        imageHeight * 0.25,
        imageWidth * 0.3
      )
      ctx.font = 0.025 * imageWidth + 'px ' + stdFontName
      ctx.fillText(
        unitString,
        imageWidth * 0.0625,
        imageHeight * 0.7,
        imageWidth * 0.07
      )
    }
  }
  ctx.restore()
}

export default drawTitleImage
