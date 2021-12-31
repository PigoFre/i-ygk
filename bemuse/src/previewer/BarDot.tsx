import './BarDot.scss'
import React from 'react'

export const BarDot: React.FC<{
  fraction: number
  fill: string
}> = (props) => (
  <svg width={32} height={32} viewBox='0 0 32 32' className='BarDot'>
    {props.fraction > 0 ? (
      props.fraction < 0.99 ? (
        <path
          fill={props.fill}
          d={describeArc(16, 16, 16, 0, props.fraction * 360)}
        />
      ) : (
        <circle cx={16} cy={16} r={16} fill={props.fill} />
      )
    ) : null}
  </svg>
)

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  var start = polarToCartesian(x, y, radius, endAngle)
  var end = polarToCartesian(x, y, radius, startAngle)

  var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  var d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    x,
    y,
  ].join(' ')

  return d
}
