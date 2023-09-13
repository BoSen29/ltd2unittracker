import { useEffect, useState } from 'react'
import { fetchUnits } from '../utils/api'
import { Tooltip } from 'react-tooltip'

export const useUnits = () => {
    let [units, setUnits] = useState([])

    const initFetch = async () => {
        if (units.length > 0) return
        setUnits(await fetchUnits())
    }

    useEffect(() => {
        initFetch()
    }, [])

    return units
}

export const getUnitTooltips = (units) => {
    return units.map((u, idx) => {
        //isOpen={u.name === 'Radiant Halo' ? true : false}
        return <Tooltip
            key={idx}
            id={'tooltip_' + u.name}
            anchorSelect={`.unit_${u.unitId || u._id}_image`}
        >
            <div className='tooltip__container'>
                <span style={{ "font-weight": "bold", "margin-bottom": "3px", "text-align": "center" }}>{u.name}</span>
                {
                    !!u.tooltip && <span style={{fontSize:"14px", fontStyle:'italic', marginBottom:'3px'}}>
                        {
                            u.tooltip
                        }
                    </span>
                }
                {
                    !!u.attackType && <span>
                        <img src={`https://cdn.legiontd2.com/icons/${u.attackType}.png`} />
                        <span> {u.attackType}</span>
                    </span>
                }
                {
                    !!u.armorType && <span>
                        <img src={`https://cdn.legiontd2.com/icons/${u.armorType}.png`} />
                        <span> {u.armorType}</span>
                    </span>
                }
                {
                    !!u.hp && <span>
                        <img src={`https://cdn.legiontd2.com/Icons/Health.png`} />
                        <span> {u.hp}</span>
                    </span>
                }
                {
                    !!u.dps && <span>
                        <img src={`https://cdn.legiontd2.com/icons/Damage.png`} />
                        <span> {u.dps} DPS</span>
                    </span>
                }
                {
                    u.flags?.includes("flags_flying") &&
                    <span>
                        <img src={`https://cdn.legiontd2.com/icons/GuardianAngel.png`} />
                        <span> {u.flags.includes("flags_flying")} Flying</span>
                    </span>
                }
                {
                    !!u.attackRange > 100 ?
                        <span>
                            <img src={`https://cdn.legiontd2.com/icons/Range.png`} />
                            <span> {u.attackRange} Range</span>
                        </span>
                        : u.attackRange != null ? 
                        <span >
                            <img src={`https://cdn.legiontd2.com/icons/Range.png`} />
                            <span> Melee</span>
                        </span> : ''
                }
                {
                    !!u.totalValue && <span>
                        <img src={`https://cdn.legiontd2.com/Icons/Gold.png`} />
                        <span> {u.totalValue}</span>
                    </span>
                }
                {
                    !!u.mythiumCost && <span>
                    <img src={`https://cdn.legiontd2.com/Icons/Mythium.png`} />
                    <span> {u.mythiumCost}</span>
                </span>
                }

            </div>
        </Tooltip>
    })
}

export const getTooltipNameFromImage = (imagePath, units) => {
    let tempUnit = units?.find(u => u.iconPath.toLowerCase() === imagePath.toLowerCase())
    return tempUnit?.unitId || tempUnit?._id || ''
}
