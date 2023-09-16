import './index.css'

export const HoverableIcon = (props) => {
    return <div
        style={{ gridColumnStart: props.unit.x, gridRowStart: 28 - props.unit.y }}
        className={`unit_${props.unit.displayName}_image unit__icon__container`}
        data-tooltip-id='Tooltipper'
        data-unit-id={props.unit.displayName}
        >
        <img
            src={`https://cdn.legiontd2.com/${props.unit.name}`}
            className={props.className || ''}
            key={props.idx}
          />
    </div>
}