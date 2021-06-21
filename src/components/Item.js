import React from 'react'
import { useCountUp } from 'react-countup'

const Item = ({ icon, color, label, value }) => {
  const { countUp } = useCountUp({ end: value })
  return (
    <article className='item'>
      <span className={color}>{icon}</span>
      <div>
        <h3>{countUp}</h3>
        <p>{label}</p>
      </div>
    </article>
  )
}

export default Item
