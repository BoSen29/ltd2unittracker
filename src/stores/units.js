import { useEffect, useState } from 'react'
import { fetchUnits } from '../utils/api'

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

export const getToolTip = (units, unit = '', image = '') => {
    let u = units?.find(u => u.unitId != null && u.unitId == unit) || units.find(u => u.iconPath?.toLowerCase() === image.toLowerCase())
    if (!!!u) return <div className='tooltip__container'>
        <span style={{ "font-weight": "bold", "margin-bottom": "3px", "text-align": "center" }}>Unknown unit</span>
        <span style={{ fontSize: "14px", fontStyle: 'italic', marginBottom: '3px' }}>
            Maybe the unit doesn't exist, or BoSen got lazy after an update?
        </span>
    </div>
    return <div className='tooltip__container'>
        <div>
            <img src={`https://cdn.legiontd2.com/${u.iconPath}`} className='tooltip__header__icon' />

        </div>
        <span style={{ fontWeight: "bold", marginBottom: "3px", textAlign: "center" }} className='tooltip__header__title'>{u.name}</span>

        {
            !!u.tooltip && <span style={{ fontSize: "14px", fontStyle: 'italic', marginBottom: '9px' }}>
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
            u.attackRange > 100 ?
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
}