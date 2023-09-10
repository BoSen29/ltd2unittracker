import './index.css'
import {useEffect, useRef, useState} from 'react'
import {getLeakDangerLevel } from '../../utils/misc'
//import * as PIXI from 'pixi.js';
import $ from "jquery";
import { useForkRef } from '@mui/material';

import { Tooltip } from 'react-tooltip'


function UnitInfo(name, cost, attackType, armorType, hp, dps, range, auras){
return  <div  className='unit-info-window'>
<div className='stats__container'>
  <span className='stats__entry'>
    {`name`}
              </span>
              <img src={`https://cdn.legiontd2.com/Icons/Gold.png`}  className='stats__icon' key={'stats'}/>
  </div>
  </div>
  ;
}

export default function GameBoard({player, units, mercsReceived = [], wave, recceived = [], leaks = [], 
  postGameStats = [], idx, overlayConfigValues, overlayData}) {
  const [clipboardData, setClipboardData] = useState("")
  const [showClipboard, setShowClipboard] = useState(false)
  const [leakedCreeps, setLeakedCreeps] = useState(false)
  const [showValueCalc, setShowValueCalc] = useState(false)
  const [unitToAuras, setUnitToAuras] = useState(new Map());
  const [coordsToUnit, setCoordsToUnit] = useState(new Map());

  useEffect(() => {
    if(units.length > 0){
      console.log("units not empty")
      console.log(units[0].name);
    } else
    console.log("units empty")
    }, units);

    // if(units.length > 0){
    //   console.log("units not empty==")
    //   console.log(units[0].name);
    // } else
    // console.log("units empty--")
  const copyToClipboard = () => {
    setShowClipboard(true)
    const value = {Towers: [], Wave: wave}
    value.Towers = units.map((unit) => {
      return {
        T: unit.displayName,
        X: unit.x / 2 - 4.5,
        Z: unit.y / 2 - 7,
        S: 0
      }
    })
    value.Mythium = recceived?.map(r => r.amount)[0]
    value.Gold = 0
    setClipboardData(JSON.stringify(value))

    const timeOut = setTimeout(() => {
      setShowClipboard(false)
    }, 10000)

    return () => clearTimeout(timeOut)
    
    //await navigator.clipboard.writeText(JSON.stringify(value))
  }
  let recceivedNum = recceived?.map(r => r.amount)
  let leakedNum = leaks?.map(l => l.percentage)

  //let coordsToUnit = new Map();
  

  const coordsToUnit_set = (x, y, u) => coordsToUnit.set(x + y*32, u);
const coordsToUnit_has = (x, y) => coordsToUnit.has(x + y*32);
const coordsToUnit_get = (x,y) => coordsToUnit.get(x + y*32);

//let unitToAuras;
useEffect(() => {
  let _coordsToUnit = new Map();
  
  console.log(" let _coordsToUnit = new Map();");
  const _coordsToUnit_set = (x, y, u) => _coordsToUnit.set(x + y*32, u);
const _coordsToUnit_has = (x, y) => _coordsToUnit.has(x + y*32);
const _coordsToUnit_get = (x,y) => _coordsToUnit.get(x + y*32);

  if(overlayData?.unitIdToUnitDesc?.size == 0) return;
  units?.forEach(u => {    
    _coordsToUnit_set(u.x, u.y, u);
    _coordsToUnit_set(u.x, u.y-1, u);
    _coordsToUnit_set(u.x+1, u.y, u);
    _coordsToUnit_set(u.x+1, u.y-1, u);

  });
  setCoordsToUnit(_coordsToUnit);
  let unitToAuras = new Map();
  function unitToAuras_add(u, aura){
    let auras = unitToAuras.get(u);
    if(auras == null){
      auras = [];
      unitToAuras.set(u, auras);
    }
    if((aura == "aerial_command_ability_id" && (auras.filter(a => a == aura).length > 1 || !overlayData.unitIdToUnitDesc.get(u.displayName).flags.includes("flags_flying")))
    || (aura != "aerial_command_ability_id" && auras.filter(a => a == aura).length > 0))
      return;
    auras.push(aura);
  }
  console.log("aura added222");
  for(let u of units){
    if(overlayData.unitIdToUnitDesc?.get(u.displayName) == undefined)
    console.log("unit is undefined")
    else console.log("unit is defined")
    for(let ability of overlayData.unitIdToUnitDesc?.get(u.displayName)?.abilities ?? []){
      console.log("aura added333");
      console.log("overlayData.auras.size " + overlayData.auras.size);
      console.log("overlayData.auras " + Array.from(overlayData.auras).reduce((sum, current) => sum + current, ""));
      console.log("ability: " + ability)
      if(overlayData.auras.has(ability)){
        console.log("aura added444");
        unitToAuras_add(u, ability);
        function addAuraToEligibleNeighbour(x, y){
          let au = coordsToUnit_get(x, y);
          if(au != null && au.x == x && au.y == y){
            unitToAuras_add(au, ability);
          }
        }
        console.log("aura added");
        addAuraToEligibleNeighbour(u.x-1, u.y+2);
        addAuraToEligibleNeighbour(u.x, u.y+2);
        addAuraToEligibleNeighbour(u.x+1, u.y+2);
        addAuraToEligibleNeighbour(u.x-2, u.y+1);
        addAuraToEligibleNeighbour(u.x-2, u.y);
        addAuraToEligibleNeighbour(u.x-2, u.y-1);
        addAuraToEligibleNeighbour(u.x-1, u.y-2);
        addAuraToEligibleNeighbour(u.x, u.y-2);
        addAuraToEligibleNeighbour(u.x+1, u.y-2);
        addAuraToEligibleNeighbour(u.x+2, u.y+1);
        addAuraToEligibleNeighbour(u.x+2, u.y);
        addAuraToEligibleNeighbour(u.x+2, u.y-1);
      }
    }
  }
  let aurasOrdered = Array.from(overlayData.auras);
  for(let auras of unitToAuras.values()){
    auras.sort((a1, a2)=>{
      return aurasOrdered.indexOf(a1) - aurasOrdered.indexOf(a2);
    });
  }
  // units?.forEach(u => {
  //   if(overlayData.unitIdToUnitDesc.get(u.displayName).abilities?.some(a => overlayData.auras.has(a))){
  //     let au = coordsToUnit_get(u.x-1, u.y + 2);
  //     if(au != null && au.x == u.x-1 && au.y == u.y + 2){
  //       //unitToAuras.get(au).push()
  //     }
  //   }
  // });
  setUnitToAuras(unitToAuras);
}, [overlayData, units]);
  

  if (!!!player.name) { return }

  let pgs = postGameStats[0] || null


//   {
//     ((_units) =>{ 
//   for(let i = 0; i < _units?.count; i++){
//     // if(_units[i].displayName == "sacred_steed_unit_id"){
//     //  i = i;
//     // }
//   }
// })(units);
//   }
// }

    //{}
    // units?.map((u, i) => {
    //   if(u.displayName == "sacred_steed_unit_id")
    //     u.x = 2;
    //   //  u.y = 2;
    //   //u = u;
    // })
    
    // }
//let q = unitId_UnitDesc.get("proton_unit_id");
  // add background to stage...
//
//return(<div>{units?.count ?? 12341234}</div>)
  return (
    <div className='game-board__container' key={idx}>
      <div className='unit-info-window'/>
      <div className='game-board__header'>
        <img src={player.image} title="Avatar" className='header__icon'/>
        <div className='player-info__container'>
          <img src={player.countryFlag} title={player.countryName} className='country__icon'/>
          <div className={'player'+player.player}>
            {
              player.name || 'Player ' + player.player
            }
          </div>
        </div>
        <img src={player.ratingIcon} title={player.rating} className='header__icon'/>
      </div>
      {
        !isNaN(wave) && <span className='game-board-body'>
        <div className='myth__region__container'>
        <div className='sends__container'>
          {
            mercsReceived?.map((merc, idx) => {
              return (
                <span className='send__icon__container'>
                  <img src={`https://cdn.legiontd2.com/${merc.image}`} className='send__icon' key={idx}/>
                  <span className='sends__count'>{merc.count}</span>
                </span>
                
              )
            })
          }
        </div>
        <div className='stats__container'>
          {
            pgs?.workers? <span className='stats__entry'>
              <span className='workers__text stats__text'>
                  { pgs?.workers}
              </span>
              <img src={`https://cdn.legiontd2.com/Icons/Worker.png`} className='stats__icon' key={'stats'}/>
            </span>: <span className='stats__entry'/>
          }
          {
            pgs?.fighterValue ? 
            <span className='stats__entry' onMouseEnter={() => setShowValueCalc(true)} onMouseLeave={() => setShowValueCalc(false)}>
              <span hidden={!showValueCalc}>
                <span className='value__calc'>
                  {
                    pgs?.fighterValue -pgs?.recommendedValue > 0 ? <span>{pgs?.recommendedValue}(+{pgs?.fighterValue -pgs?.recommendedValue})</span> : <span>{pgs?.recommendedValue}({pgs?.fighterValue -pgs?.recommendedValue})</span>
                  }
                </span>
              </span>
              <span className='stats__text'>
                {
                  pgs?.fighterValue
                }
              </span>
              <img src={`https://cdn.legiontd2.com/Icons/Value.png`} className='stats__icon' key={'figherValue'}/>
            </span>: <span className='stats__entry'/>
          }
          <span className='stats__entry'>
          <span className='mythium__text stats__text'>
          {
            recceivedNum
          }
          </span>
            <img src={`https://cdn.legiontd2.com/Icons/Mythium.png`} className='myth__icon' key={"mythium"}/>
          </span>
        </div>
      </div>
      {
        showClipboard? 
      <div className='clipboard'>
        <textarea value={clipboardData} readOnly onMouseEnter={(e) => e.target.select()} onMouseLeave={(e) => setShowClipboard(false)}/>
      </div> :
      <div className='game-board'> 
      
        {
          
          units?.map((unit, idx) => {
            console.log(overlayData);
            console.log("TOP " + overlayData.unitIdToUnitDesc);
            return (
              [(()=>
                {
                  console.log("BOT " +overlayData);
                  console.log("BOT " +overlayData.unitIdToUnitDesc);
                  
                  //console.log("gameboard");
                  //console.log("gameboard " + units[0].name)
                  //return <div className="line_left" style={{gridColumnStart:unit.x, gridRowStart: 28-unit.y}}/>
                  let renderArray = [];
                 //renderArray.push(<div className="line_left" style={{gridColumnStart:unit.x, gridRowStart: 28-unit.y}}/>);
               //   return renderArray;
              //let l1 = <div/>
                  if(overlayConfigValues.Aura && unitToAuras != null){
                    let auras = unitToAuras.get(unit);
                    let q =coordsToUnit.get(5,32);
                    if(auras != null && auras.length > 0){
                      function unitWithSameAura(x, y, dir){
                        if(x < 1 || x > 18 || y < 0 || y > 28) return;
                        let otherU = coordsToUnit_get(x,y);
                        if(otherU != null){
                          let otherA = unitToAuras.get(otherU);
                          if(otherA == null || !otherA.some(a => auras.includes(a))){
              renderArray.push(<div className={`line_${dir}`} style={{gridColumnStart:x, gridRowStart: 28-y}}/>);
              //renderArray.push(<div className="line_left" style={{gridColumnStart:6, gridRowStart: 6}}/>);
              //l1 = <div className="line_left" style={{gridColumnStart:x, gridRowStart: 28-y}}/>;
             // return renderArray;
              otherA = otherA;
                          }
                        }
                        else
                        renderArray.push(<div className={`line_${dir}`} style={{gridColumnStart:x, gridRowStart: 28-y}}/>);
                      }

                      unitWithSameAura(unit.x-1, unit.y, "right");
                      unitWithSameAura(unit.x, unit.y+1, "bot");
                      unitWithSameAura(unit.x, unit.y-1, "top");
                      unitWithSameAura(unit.x+1, unit.y, "left");
                      unitWithSameAura(unit.x-1, unit.y-1, "right");
                      unitWithSameAura(unit.x+1, unit.y+1, "bot");                      
                      //unitWithSameAura(unit.x+1, unit.y-1, "bot");
                      unitWithSameAura(unit.x, unit.y-2, "top");
                      unitWithSameAura(unit.x+1, unit.y-2, "top");
                      unitWithSameAura(unit.x+2, unit.y, "left");
                      unitWithSameAura(unit.x+2, unit.y-1, "left");

                    } else{}
                    //  return renderArray;
                  }
                  return renderArray;
                })()
              ,
              // we need to "fix" the row start since the data is in format of an actual coordinate system starting bottom left
              <div  className='parent' style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}}>
              

              <img data-tooltip-place="right-start"  data-tooltip-id={`tooltipId${unit.x}-${unit.y}`} src={`https://cdn.legiontd2.com/${unit.name}`} className='unit__icon' style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}} key={idx}
         
              />
              <Tooltip id={`tooltipId${unit.x}-${unit.y}`} className='unit-info-window' >
              <span style={{"font-size": 18, "font-weight":"bold", "margin-bottom":"1vh", "text-align":"center"}}>{overlayData.unitIdToUnitDesc.get(unit.displayName).ingameName}</span>

              <span style={{"font-size": 18}}>
                <img className='transparentBackground' src={`https://cdn.legiontd2.com/icons/${overlayData.unitIdToUnitDesc.get(unit.displayName).attackType}.png`}/>
                <span style={{"vertical-align": "top", "position":"relative", "top":"-0.25vh"}} vertical-align="top"> {overlayData.unitIdToUnitDesc.get(unit.displayName).attackType}</span>
              </span>
              <span style={{"font-size": 18}}>
                <img className='transparentBackground' src={`https://cdn.legiontd2.com/icons/${overlayData.unitIdToUnitDesc.get(unit.displayName).armorType}.png`}/>
                <span> {overlayData.unitIdToUnitDesc.get(unit.displayName).armorType}</span>
              </span>
              <span style={{"font-size": 18}}>
                <img className='transparentBackground' src={`https://cdn.legiontd2.com/Icons/Health.png`}/>
                <span> {overlayData.unitIdToUnitDesc.get(unit.displayName).hp}</span>
              </span>
              <span style={{"font-size": 18}}>
                <img className='transparentBackground' src={`https://cdn.legiontd2.com/icons/Damage.png`}/>
                <span> {overlayData.unitIdToUnitDesc.get(unit.displayName).dps} DPS</span>
              </span>
              {
                overlayData.unitIdToUnitDesc.get(unit.displayName).flags.includes("flags_flying") &&
                <span style={{"font-size": 18}}>
                <img className='transparentBackground' src={`https://cdn.legiontd2.com/icons/GuardianAngel.png`}/>
                  <span> {overlayData.unitIdToUnitDesc.get(unit.displayName).flags.includes("flags_flying")} Flying</span>
                </span>
              }
              {
                overlayData.unitIdToUnitDesc.get(unit.displayName).attackRange > 100 ?
                <span style={{"font-size": 18}}>
                  <img className='transparentBackground' src={`https://cdn.legiontd2.com/icons/Range.png`}/>
                  <span> {overlayData.unitIdToUnitDesc.get(unit.displayName).attackRange} Range</span>
                </span>
                :
                <span style={{"font-size": 18}}>
                <img className='transparentBackground' src={`https://cdn.legiontd2.com/icons/Range.png`}/>
                <span> Melee</span>
              </span>
              }
                            <span style={{"font-size": 18}}>
                <img src={`https://cdn.legiontd2.com/Icons/Gold.png`} className='transparentBackground'/>
                <span style={{"vertical-align":"text-top", "margin-bot":2}}> {overlayData.unitIdToUnitDesc.get(unit.displayName).totalValue}</span>
              </span>
              {
                unitToAuras.get(unit)?.length > 0 &&
                <span style={{"font-size": 18, "display":"flex", "flex-direction":"column", "margin-top":"1vh","font-weight":"600"}}>
                  Active auras: 
                {
                unitToAuras.get(unit).map(aura => 
                  <span style={{"font-size": 18, "font-weight":"450"}}>
                  <img className='transparentBackground' src={`https://cdn.legiontd2.com/icons/${overlayData.auraIdToDisplayName.get(aura)}.png`} />  
                  <span> {overlayData.auraIdToDisplayName.get(aura)}</span>
                </span>                
                )
                }                 
                </span>
          }
              </Tooltip>
              {
                ((o) => {
                  console.log(overlayData);
                  console.log("HERE HERE " + overlayData.unitIdToUnitDesc);
                  console.log("HERE HERE " + overlayData.unitIdToUnitDesc.count);
              return overlayConfigValues.AttackDefense ?
              <div>
              <img className='unit__overlay__topleft' src={`https://cdn.legiontd2.com/icons/${overlayData.unitIdToUnitDesc.get(unit.displayName).attackType}.png`} style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}}/>
                 <img className='unit__overlay__topmid' src={`https://cdn.legiontd2.com/icons/${overlayData.unitIdToUnitDesc.get(unit.displayName).armorType}.png`} style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}}/> 
                 </div>
                 : <div/>
                })(overlayData)
                 
          }
                                          {
              overlayConfigValues.Cost ?
              <div>
              
                 
                 <div className='unit__overlay__botmidleft unit__overlay__text' >{overlayData.unitIdToUnitDesc.get(unit.displayName).totalValue}</div>
                 </div>
                 : <div/>
                 
          }
{
  (()=>
  {
//let l1 = <div/>
      let renderArray = [];
    if(overlayConfigValues.Aura && unitToAuras != null){
      let auras = unitToAuras.get(unit);
      if(auras != null && auras.length > 0){

        if(auras[0] == "aerial_command_ability_id"){
          let k= 1;
        }
//</>        renderArray.push(<img className='unit__overlay__topright' src={`https://cdn.legiontd2.com/icons/${auras[0].split("_ability_id")[0].replace(/^./, auras[0][0].toUpperCase()).replace("Aerial_command", 'AerialCommand')}.png`} style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}}/>);
//return renderArray;
//return <div className="line_left" style={{gridColumnStart:unit.x, gridRowStart: 28-unit.y}}/>
renderArray.push(
//<img className='unit__overlay__topright' src={`https://cdn.legiontd2.com/icons/${auras[0].split("_ability_id")[0].replace(/^./, auras[0][0].toUpperCase()).replace("Aerial_command", 'AerialCommand')}.png`} style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}}/>  
  <img className='unit__overlay__topright' src={`https://cdn.legiontd2.com/icons/${overlayData.auraIdToDisplayName.get(auras[0])}.png`} style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}}/>  
);

if(auras.length > 1){
  renderArray.push(
    <img className='unit__overlay__midright' src={`https://cdn.legiontd2.com/icons/${overlayData.auraIdToDisplayName.get(auras[1])}.png`} style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}}/>  
    );

    if(auras.length > 2){
      renderArray.push(
        <img className='unit__overlay__botright' src={`https://cdn.legiontd2.com/icons/${overlayData.auraIdToDisplayName.get(auras[2])}.png`} style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}}/>  
        );
    }
}
      }
    }

    return renderArray;
  })()
}

          <div></div>
          {
            (() => {
              return (<div></div>);
            })()
          }
            </div>
              ]
              //<img src={`https://cdn.legiontd2.com/Icons/Butcher.png`} className='unit__icon' style={{gridColumnStart: unit.x, gridRowStart: 28 - unit.y}} key={idx} title={unit.name.split('/')[1].replace(".png",'')}/>
            )
          })
        }
      </div>
      }
      <div className={['player__color-marker', 'player'+player.player+'__background'].join(' ')}/>
      <div className='game-board__footer'>
        <div className='leak__container'>
          {
            leakedNum > 0 && <span onMouseEnter={() => setLeakedCreeps(true)} onMouseLeave={() => setLeakedCreeps(false)}>
              <span hidden={!leakedCreeps}>
                <span className='leaked__creeps__container'>
                {
                  pgs?.unitsLeaked?.map(l => {
                    return <img src={`https://cdn.legiontd2.com/${l.replace('hud/img/', '')}`} className='img__leaked__unit'/>
                  }) 
                }
                </span>
              </span>
              <div style={{color: getLeakDangerLevel(leakedNum)}} className='leak__number'>{leakedNum}% leak {!!pgs?.unitsLeaked ? '↑': ''}</div>
            </span>
          }
        </div>
        {
          !showClipboard ? <div className={'copy-button'} onClick={copyToClipboard}>{'Copy build'}</div>:
          <div className={'copy-button'} onClick={() => setShowClipboard(false)}>{'Hide'}</div>
        }
      </div></span>
      }
      
    </div>
  )
}
