import React from "react";
import adjacencyData from "../data/adjacencyData.json";
import tileData, {WORMHOLE_SYMBOLS} from "../data/tileData";
import raceData from "../data/raceData.json";

import influence from './icons/influence.png';
import planet from './icons/planet.png';
import resource from './icons/resource.png';
import specialtyBiotic from './icons/specialty-biotic.png';
import specialtyWarfare from './icons/specialty-warfare.png';
import specialtyPropulsion from './icons/specialty-propulsion.png';
import specialtyCybernetic from './icons/specialty-cybernetic.png';
import traitCultural from './icons/trait-cultural.png';
import traitHazardous from './icons/trait-hazardous.png';
import traitIndustrial from './icons/trait-industrial.png';

class MoreInfo extends React.Component {
    constructor(props) {
        super(props);

        this.getAdjacent = this.getAdjacent.bind(this);
    }

    getAdjacent(tileNumber) {
        // TODO rewrite this to calculate adjacencies, not reference them from a data file
        let originalAdjacencies = [...adjacencyData[tileNumber]];
        let adjacencies = [...adjacencyData[tileNumber]];
        // adjacencies.push(tileNumber);  // Add back in if we want to add the home system to these calcs

        let planets = 0;
        let resources = 0;
        let influence = 0;
        let wormholes = [];
        let specialties = {
            "biotic": 0,
            "warfare": 0,
            "propulsion": 0,
            "cybernetic": 0
        };
        let traits = {
            "cultural": 0,
            "industrial": 0,
            "hazardous": 0
        }

        while (adjacencies.length > 0) {
            let adjacentTileNumber = adjacencies.splice(0, 1)[0]
            let adjacentTile = this.props.tiles[adjacentTileNumber]
            if (tileData.hyperlanes.indexOf(this.props.getTileNumber(adjacentTile)) >= 0) {
                // This is a hyperlane, so add the tiles that are linked
                let hyperlaneAdjacencies = [...adjacencyData[adjacentTileNumber]];
                let tilePositionRelatedToHyperlane = hyperlaneAdjacencies.indexOf(Number(tileNumber)); // In the future this code can be adapted, with this tile number being the source tile
                let hyperlaneLinks = tileData.all[this.props.getTileNumber(adjacentTile)]["hyperlanes"];
                let currentRotation = Number(adjacentTile.split("-")[1])

                for (let hyperlane of hyperlaneLinks) {
                    let hyperlaneStart = (hyperlane[0] + currentRotation) % 6;
                    let hyperlaneEnd = (hyperlane[1] + currentRotation) % 6;
                    let hyperlaneStartTilenumber = hyperlaneAdjacencies[hyperlaneStart]
                    let hyperlaneEndTilenumber = hyperlaneAdjacencies[hyperlaneEnd]

                    if (hyperlaneStart === tilePositionRelatedToHyperlane && originalAdjacencies.indexOf(hyperlaneEndTilenumber) < 0) {
                        // Add the tile on the other end of this hyperlane to be added to the total
                        adjacencies.push(hyperlaneEndTilenumber)
                    } else if (hyperlaneEnd === tilePositionRelatedToHyperlane && originalAdjacencies.indexOf(hyperlaneStartTilenumber) < 0) {
                        // Add the tile on the other end of this hyperlane to be added to the total
                        adjacencies.push(hyperlaneStartTilenumber)
                    }
                }
            }
            if (adjacentTile in tileData.all) {
                for (let planetIndex in tileData.all[adjacentTile].planets) {
                    let planet = tileData.all[adjacentTile].planets[planetIndex];
                    // console.log(planet)
                    planets += 1;
                    resources += planet.resources;
                    influence += planet.influence;
                    specialties[planet.specialty] += 1;
                    traits[planet.trait] += 1;
                }
                for (let wormholeIndex in tileData.all[adjacentTile].wormhole){
                    if (!(tileData.all[adjacentTile].wormhole[wormholeIndex] in wormholes)){
                        wormholes.push(tileData.all[adjacentTile].wormhole[wormholeIndex])
                    }
                }
            }
        }
        return {
            "planets": planets,
            "resources": resources,
            "influence": influence,
            "specialties": specialties,
            "traits": traits,
            "wormholes": wormholes
        }
    }

    getInfoFromTiles(tiles) {
        return tiles.reduce((acc, tile) => {
            if (tile in tileData.all) {
                for (let planetIndex in tileData.all[tile].planets) {
                    let planet = tileData.all[tile].planets[planetIndex];
                    // console.log(planet)
                    acc.planets += 1;
                    acc.resources.total += planet.resources;
                    acc.influence.total += planet.influence;
                    if (planet.resources > planet.influence) {
                        acc.resources.optimal += planet.resources;
                    } else if (planet.influence > planet.resources) {
                        acc.influence.optimal += planet.influence;
                    } else {
                        acc.resources.optimal += planet.resources / 2;
                        acc.influence.optimal += planet.influence / 2;
                    }
                    acc.specialties[planet.specialty] += 1;
                    acc.traits[planet.trait] += 1;
                }
                for (let wormholeIndex in tileData.all[tile].wormhole){
                    if (!(tileData.all[tile].wormhole[wormholeIndex] in acc.wormholes)){
                        acc.wormholes.push(tileData.all[tile].wormhole[wormholeIndex])
                    }
                }
            }

            return acc;
        }, {
            planets: 0,
            resources: {
                optimal: 0,
                total: 0
            },
            influence: {
                optimal: 0,
                total: 0
            },
            specialties: {
                "biotic": 0,
                "warfare": 0,
                "propulsion": 0,
                "cybernetic": 0
            },
            traits: {
                "cultural": 0,
                "industrial": 0,
                "hazardous": 0
            },
            wormholes: []
        });
    }

    render() {
        const slices = [];

        for (let i = 0; i < 6; i++) {
            let slice = {
                playerName: "",
                tiles: [],
                homeSystem: 0,
                info: undefined
            };
            // Inner circle
            slice.tiles.push(this.props.tiles[i + 1])
            // Middle Circle
            if (i === 0) {
                slice.tiles.push(this.props.tiles[18])
            } else {
                slice.tiles.push(this.props.tiles[i * 2 + 6])
            }
            slice.tiles.push(this.props.tiles[i * 2 + 7])
            slice.tiles.push(this.props.tiles[i * 2 + 8])
            // Outer Circle
            slice.homeSystem = this.props.tiles[i * 3 + 19]
            if (i === 0) {
                slice.tiles.push(this.props.tiles[36])
            } else {
                slice.tiles.push(this.props.tiles[i * 3 + 18])
            }
            slice.tiles.push(this.props.tiles[i * 3 + 20])

            console.log(slice.homeSystem, slice.tiles)

            slice.playerName = this.props.currentPlayerNames[i];
            if (slice.playerName === "") {
                slice.playerName = "P" + (i + 1);
            }

            slice.info = this.getInfoFromTiles(slice.tiles);

            slices.push(
                <tr key={"more-info-" + slice.playerName} >
                    <th scope="row">{slice.playerName}</th>
                    <td>{raceData.homeSystemToRaceMap[slice.homeSystem]}<br />Home Tile: {slice.homeSystem}</td>
                    <td>{slice.info.resources.optimal}/{slice.info.resources.total}</td>
                    <td>{slice.info.influence.optimal}/{slice.info.influence.total}</td>
                    <td>
                        <span className={"d-flex"}>
                            {[...Array(slice.info.traits.cultural)].map((e, i) => <img key={slice.playerName + "-cultural-" + i} className={"icon"} src={traitCultural} alt={"C"}/>)}
                            {[...Array(slice.info.traits.hazardous)].map((e, i) => <img key={slice.playerName + "-hazardous-" + i} className={"icon"} src={traitHazardous} alt={"H"}/>)}
                            {[...Array(slice.info.traits.industrial)].map((e, i) => <img key={slice.playerName + "-industrial-" + i} className={"icon"} src={traitIndustrial} alt={"I"}/>)}
                            {[...Array(slice.info.wormholes)].map((e, i) => <p className="icon" key={`${slice.playerName}-wormhole-${i}`}>{WORMHOLE_SYMBOLS[e]}</p>)}
                        </span>
                    </td>
                    <td>
                        <span className={"d-flex"}>
                            {[...Array(slice.info.specialties.biotic)].map((e, i) => <img key={slice.playerName + "-biotic-" + i} className={"icon"} src={specialtyBiotic} alt={"B"}/>)}
                            {[...Array(slice.info.specialties.warfare)].map((e, i) => <img key={slice.playerName + "-warfare-" + i} className={"icon"} src={specialtyWarfare} alt={"W"}/>)}
                            {[...Array(slice.info.specialties.propulsion)].map((e, i) => <img key={slice.playerName + "-propulsion-" + i} className={"icon"} src={specialtyPropulsion} alt={"P"}/>)}
                            {[...Array(slice.info.specialties.cybernetic)].map((e, i) => <img key={slice.playerName + "-cybernetic-" + i} className={"icon"} src={specialtyCybernetic} alt={"C"}/>)}
                        </span>
                    </td>
                </tr>
            );
        }

        return (
            <div id="moreInfoContainer" className={this.props.visible ? "" : "d-none"}>
                <div className="title">
                    <h4 id="infoTitle" className="text-center">Assets Per Slice</h4>
                </div>
                <div id="moreInfo" className="">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col"></th>
                                <th scope="col">Race</th>
                                <th scope="col"><img className={"icon"} src={resource} alt={"Res."}/></th>
                                <th scope="col"><img className={"icon"} src={influence} alt={"Inf."}/></th>
                                <th scope="col"><img className={"icon"} src={planet} alt={"Planets"}/></th>
                                <th scope="col"><img className={"icon"} src={specialtyWarfare} alt={"Tech"}/></th>
                            </tr>
                        </thead>
                        <tbody>
                            {slices}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    render2() {
        let moreInfoByPlayer = [];

        for (let tileNumber in this.props.tiles) {
            if ((this.props.tiles[tileNumber] >= 0 && this.props.tiles[tileNumber] < 18) ||
                (this.props.tiles[tileNumber] >= 51 && this.props.tiles[tileNumber] < 59)) {
                // This is a homeworld, so gather its info
                let adjacentInfo = this.getAdjacent(tileNumber);
                let playerName = this.props.currentPlayerNames[moreInfoByPlayer.length];
                if (playerName === "") {
                    playerName = "P" + (moreInfoByPlayer.length + 1);
                }
                moreInfoByPlayer.push(
                    <tr key={"more-info-" + playerName} >
                        <th scope="row">{playerName}</th>
                        <td>{raceData.homeSystemToRaceMap[this.props.tiles[tileNumber]]}<br />Home Tile: {this.props.tiles[tileNumber]}</td>
                        <td>{adjacentInfo.resources}</td>
                        <td>{adjacentInfo.influence}</td>
                        <td>
                            <span className={"d-flex"}>
                                {[...Array(adjacentInfo.traits.cultural)].map((e, i) => <img key={playerName + "-cultural-" + i} className={"icon"} src={traitCultural} alt={"C"}/>)}
                                {[...Array(adjacentInfo.traits.hazardous)].map((e, i) => <img key={playerName + "-hazardous-" + i} className={"icon"} src={traitHazardous} alt={"H"}/>)}
                                {[...Array(adjacentInfo.traits.industrial)].map((e, i) => <img key={playerName + "-industrial-" + i} className={"icon"} src={traitIndustrial} alt={"I"}/>)}
                                {[...Array(adjacentInfo.wormholes)].map((e, i) => <p className="icon" key={`${playerName}-wormhole-${i}`}>{WORMHOLE_SYMBOLS[e]}</p>)}
                            </span>
                        </td>
                        <td>
                            <span className={"d-flex"}>
                                {[...Array(adjacentInfo.specialties.biotic)].map((e, i) => <img key={playerName + "-biotic-" + i} className={"icon"} src={specialtyBiotic} alt={"B"}/>)}
                                {[...Array(adjacentInfo.specialties.warfare)].map((e, i) => <img key={playerName + "-warfare-" + i} className={"icon"} src={specialtyWarfare} alt={"W"}/>)}
                                {[...Array(adjacentInfo.specialties.propulsion)].map((e, i) => <img key={playerName + "-propulsion-" + i} className={"icon"} src={specialtyPropulsion} alt={"P"}/>)}
                                {[...Array(adjacentInfo.specialties.cybernetic)].map((e, i) => <img key={playerName + "-cybernetic-" + i} className={"icon"} src={specialtyCybernetic} alt={"C"}/>)}
                            </span>
                        </td>
                    </tr>
                );
            }

        }
        return (
            <div id="moreInfoContainer" className={this.props.visible ? "" : "d-none"}>
                <div className="title">
                    <h4 id="infoTitle" className="text-center">Assets Adjacent to Home System</h4>
                </div>
                <div id="moreInfo" className="">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col"></th>
                                <th scope="col">Race</th>
                                <th scope="col"><img className={"icon"} src={resource} alt={"Res."}/></th>
                                <th scope="col"><img className={"icon"} src={influence} alt={"Inf."}/></th>
                                <th scope="col"><img className={"icon"} src={planet} alt={"Planets"}/></th>
                                <th scope="col"><img className={"icon"} src={specialtyWarfare} alt={"Tech"}/></th>
                            </tr>
                        </thead>
                        <tbody>
                            {moreInfoByPlayer}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    
}
export default MoreInfo;
