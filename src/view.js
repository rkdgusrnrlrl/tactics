import * as Menu from "./menu"
import * as Map from "../lib/map"
import * as Unit from "../lib/unit"
import * as Cell from "../lib/cell"
import * as Game from "../lib/game"
import pathfind from "../lib/pathfind"
import Canvas from "../lib/canvas"
import Anims from "./anims"
import Anim from "./anim"

const blue = "rgb(80, 120, 248)"
const red = "rgb(208, 0, 88)"
const cyan = "rgb(144, 224, 232)"
const pink = "rgb(248, 192, 224)"
const symbols = {
	warrior: "axe",
	knight: "shield",
	rogue: "dagger",
	mage: "hat"
}

export function create(width, height, sprites) {
	let canvas = document.createElement("canvas")
	canvas.width = width
	canvas.height = height

	return {
		sprites: sprites,
		context: canvas.getContext("2d"),
		state: {
			time: 0,
			anims: [ Anim("phase", "player", Anims.phase()) ],
			cursor: {
				cell: null,
				prev: null,
				selection: null,
				under: null
			},
			viewport: {
				size: [ width, height ],
				position: null,
				offset: [ 0, 0 ],
				target: null,
				shake: 0
			},
			ai: {
				strategy: null,
				index: 0,
				action: 0,
				moved: false,
				attacked: false
			},
			menu: null,
			paused: false,
			attacks: [],
			dialogs: [],
			log: []
		},
		cache: {
			map: null,
			selection: null,
			selected: null,
			target: null,
			moved: false,
			attack: null,
			phase: {
				faction: "player",
				pending: null,
				done: false
			},
			units: null,
			ranges: [],
			squares: [],
			particles: [],
			log: null,
			menu: {
				box: null,
				labels: []
			},
			dialogs: {
				objective: null,
				selection: null,
				target: null
			}
		}
	}
}

export function update(view) {
	let { cache, state } = view
	state.time++

	let cursor = state.cursor
	if (cursor.selection) {
		cursor.selection.time++
	} else if (cache.selection) {
		cache.selection.time++
	}

	if (cache.target) {
		cache.target.time++
	}

	if (cache.attack && cache.attack.connected) {
		cache.attack.time++
	}

	let anims = view.state.anims
	let anim = anims[0]
	if (!anim) return
	if (anim.done) {
		anims.shift()
	} else {
		Anims[anim.type].update(anim)
	}
}

export function render(view, game) {
	let { context, sprites, cache } = view
	let { time, cursor, viewport, anims, attacks, dialogs, log, ai } = view.state
	let { map } = game
	let canvas = context.canvas
	let anim = anims[0]
	let attack = attacks[0]
	let dialog = dialogs[0]
	let order = [
		"floors",
		"squares",
		"shadows",
		"walls",
		"pieces",
		"arrows",
		"cursor",
		"selection",
		"effects",
		"ui"
	]

	let layers = {}
	for (let name of order) {
		layers[name] = []
	}

	context.beginPath()
	context.fillStyle = "black"
	context.fillRect(0, 0, canvas.width, canvas.height)

	if (!cache.units) {
		cache.units = map.units.map(unit => Object.assign({ original: unit }, unit))
	}

	if (!cache.map) {
		cache.map = drawMap(map, sprites.tiles)
	}

	layers.floors.push({
		image: cache.map.floors,
		position: [ 0, 0 ]
	})

	layers.walls.push({
		image: cache.map.walls,
		position: [ 0, 0 ]
	})

	if (!cursor.cell) {
		let unit = map.units.find(unit => unit.faction === "player")
		cursor.cell = unit.cell.slice()
		cursor.prev = cursor.cell.slice()
	}

	if (!cache.log) {
		let box = sprites.ui.Box(viewport.size[0] - 16, 36)
		let element = {
			image: box,
			position: [ 8, viewport.size[1] ]
		}
		cache.log = {
			row: 0,
			col: 0,
			focus: 0,
			time: 0,
			interrupt: true,
			bookmark: 0,
			box: element,
			texts: [],
			surface: Canvas(box.width - 16, box.height - 16),
		}
	}

	let enemies = map.units.filter(unit => unit.faction === "enemy")
	let enemy = ai.strategy ? enemies[ai.index] : null
	let actions = dialog && dialog.type === "actions" && dialog
	let forecast = dialog && dialog.type === "forecast" && dialog
	let pause = dialog && dialog.type === "pause" && dialog
	let updated = !log.length
		|| cache.log.row === log.length - 1
		&& cache.log.col === log[log.length - 1].length - 1
	let visible = (!updated || !cache.log.interrupt && cache.log.time < 300)
		&& (attack || !cache.log.interrupt && !Cell.manhattan(cursor.cell, cursor.prev) > 1e-3)
		&& !pause
	if (visible) {
		// log is not up to date, or up to date and log presence has not exceeded time delay
		let { box, surface } = cache.log
		if (cache.log.interrupt) {
			cache.log.interrupt = false
			cache.log.time = 0
			box.image
				.getContext("2d")
				.fillRect(8, 8, box.image.width - 16, box.image.height - 16)
		}

		let target = viewport.size[1] - box.image.height - 8
		box.position[1] += (target - box.position[1]) / 8
		if (Math.abs(target - box.position[1]) < 4) {
			if (cache.log.focus < cache.log.row && cache.log.row >= 2 && cache.log.row < log.length) {
				cache.log.focus += (cache.log.row - cache.log.focus) / 8
			}

			let content = log[cache.log.row].slice(0, cache.log.col + 1)
			let text = sprites.ui.Text(content)
			cache.log.texts[cache.log.row] = text
			surface.canvas.height = Math.max(0, (log.length - cache.log.bookmark) * 12 - 4)

			let visible = cache.log.row - cache.log.bookmark
			for (let i = cache.log.bookmark; i <= cache.log.row; i++) {
				let text = cache.log.texts[i]
				surface.drawImage(text, 0, (i - cache.log.bookmark) * 12)
			}

			let temp = Canvas(box.image.width - 16, box.image.height - 16)
			let offset = Math.max(0, (cache.log.focus - cache.log.bookmark - 1) * 12)
			temp.drawImage(cache.log.surface.canvas, 0, -Math.ceil(offset))

			let context = box.image.getContext("2d")
			context.fillRect(8, 8, box.image.width - 16, box.image.height - 16)
			context.drawImage(temp.canvas, 8, 8)

			if (cache.log.col !== log[cache.log.row].length - 1) {
				cache.log.col++
			} else if (cache.log.row !== log.length - 1) {
				cache.log.row++
				cache.log.col = 0
			} else {
				cache.log.time++
			}
		}
		layers.ui.push(box)
	} else {
		if (!cache.log.interrupt) {
			cache.log.interrupt = true
			cache.log.bookmark = cache.log.row + 1
		}
		let box = cache.log.box
		let target = viewport.size[1] + box.image.height
		if (box.position[1] < target) {
			box.position[1] += Math.min(8, target - box.position[1])
			layers.ui.push(box)
		}
	}

	if (!anims.length && !attack && updated || !cache.phase.pending) {
		if (cache.phase.faction !== game.phase.faction) {
			cursor.cell = game.phase.pending[0].cell.slice()
			anim = anims[0] = Anim("phase", game.phase.faction, Anims.phase())
		}
		cache.phase = {
			pending: game.phase.pending.slice(),
			faction: game.phase.faction,
			done: false
		}
	}

	let phasing = anim && anim.type === "phase"
	let focus = null
	if (!phasing || !viewport.target) {
		if (attack) {
			focus = attack.target.cell
		} else if (game.phase.faction === "enemy" && enemy) {
			focus = enemy.cell
		} else if (forecast && !cache.moved) {
			let target = dialog.options[dialog.index]
			focus = target.cell
		} else if (!cursor.selection || !game.phase.pending.includes(cursor.selection.unit) || cache.moved) {
			focus = cursor.cell
		} else if (cursor.selection && game.phase.pending.includes(cursor.selection.unit)) {
			focus = cursor.selection.unit.cell
		}
	}

	if (!viewport.target) {
		viewport.target = []
	}

	let width = Map.width(map) * 16
	if (width > viewport.size[0]) {
		if (focus) {
			viewport.target[0] = focus[0] * 16 + 8 - viewport.size[0] / 2
		}
	} else {
		viewport.target[0] = width / 2 - viewport.size[0] / 2
	}

	let height = Map.height(map) * 16
	if (height > viewport.size[1]) {
		if (focus) {
			viewport.target[1] = focus[1] * 16 + 8 - viewport.size[1] / 2
		}
	} else {
		viewport.target[1] = height / 2 - viewport.size[1] / 2
	}

	let priority = !phasing && (forecast || attack || cache.phase.faction === "enemy")
	if (!priority) {
		let max = width - viewport.size[0]
		if (width > viewport.size[0]) {
			if (viewport.target[0] < 0) {
				viewport.target[0] = 0
			} else if (viewport.target[0] > max) {
				viewport.target[0] = max
			}
		}
		let may = height - viewport.size[1]
		if (height > viewport.size[1]) {
			if (viewport.target[1] < 0) {
				viewport.target[1] = 0
			} else if (viewport.target[1] > may) {
				viewport.target[1] = may
			}
		}
	}

	if (!viewport.position) {
		viewport.position = viewport.target.slice()
	} else {
		viewport.position[0] += (viewport.target[0] - viewport.position[0]) / 16
		viewport.position[1] += (viewport.target[1] - viewport.position[1]) / 16
	}

	if (cache.attack && cache.attack.connected && cache.attack.time === 1) {
		viewport.shake = 30
	}

	if (viewport.shake) {
		viewport.shake--
		let period = 5
		let amplitude = attack.power
		let duration = 30
		let progress = 1 - (viewport.shake % period) / period
		let axis = attack.attacker.cell[1] - attack.target.cell[1]
			? 1
			: 0
		viewport.offset[axis] = Math.sin(progress * 2 * Math.PI) * amplitude * viewport.shake / duration
	} else {
		viewport.offset[0] = 0
		viewport.offset[1] = 0
	}

	let selection = cursor.selection || cache.selection
	if (selection && cache.phase.faction !== "enemy") {
		let unit = selection.unit
		let time = selection.time
		let index = map.units.indexOf(unit)
		let cached = cache.units[index]
		let range = cache.ranges[index]
		if (!range) {
			range = cache.ranges[index] = Unit.range(map, unit)
		}

		let squares = cache.squares[index]
		if (!squares) {
			cache.squares[index] = squares = []
			for (let cell of range.move) {
				squares.push({
					sprite: sprites.ui.squares.move,
					cell: cell
				})
			}
			for (let cell of range.attack) {
				let valid = true
				for (let other of range.move) {
					if (Cell.equals(cell, other)) {
						valid = false
						break
					}
				}
				if (valid) {
					squares.push({
						sprite: sprites.ui.squares.attack,
						cell: cell
					})
				}
			}
		}

		if (cursor.selection && cache.selection !== cursor.selection) {
			cache.selection = selection
			cache.path = null
		}

		if (cursor.selection && !anims.find(anim => anim.target === cached)) {
			anims.push(
				Anim("lift", cached, Anims.lift())
			)
		}

		if (cache.selection && cache.selection !== cursor.selection) {
			cache.moved = false
			if (anim && anim.type === "lift") {
				anim.done = true
				anims.push(
					Anim("drop", anim.target, Anims.drop(anim.data.height))
				)
				cache.selection.time = 0
			}
		}

		let moving = anim && anim.type === "move" && anim.target === cached
		let attacking = anim && anim.type === "attack" && anim.target === cached
		if (!cache.moved) {
			let radius = 0
			if (cursor.selection) {
				radius = selection.time
			} else {
				let max = 0
				for (let square of squares) {
					let steps = Cell.manhattan(unit.cell, square.cell)
					if (steps > max) {
						max = steps
					}
				}
				radius = Math.max(0, max - selection.time)
			}
			if (radius) {
				squares = squares.filter(square => Cell.manhattan(unit.cell, square.cell) <= radius)
				renderSquares(layers, sprites.ui.squares, squares)
			}
		}

		let path = cache.path
		let target = Map.unitAt(map, cursor.cell)
		if (Cell.equals(cursor.cell, unit.cell)) {
			if (path) {
				path.length = 1
			}
		} else if (game.phase.pending.includes(unit)
		&& cursor.selection
		) {
			let cells = range.move.slice()
			let allies = map.units.filter(other => Unit.allied(unit, other))
			for (let ally of allies) {
				cells.push(ally.cell)
			}

			let dest = unit.cell
			if (path && path.length) {
				dest = path[path.length - 1]
			}

			if (range.move.find(cell => Cell.equals(cursor.cell, cell))) {
				if (!path) {
					path = cache.path = pathfind(cells, unit.cell, cursor.cell)
				} else {
					for (var i = 0; i < path.length; i++) {
						let cell = path[i]
						if (Cell.equals(cursor.cell, cell)) {
							break
						}
					}
					if (i < path.length - 1) {
						// truncate the path up to the current cell
						path.splice(i + 1, path.length - i - 1)
					} else {
						let pathless = cells.filter(cell => !path.find(other => Cell.equals(cell, other)))
						let prev = path[path.length - 1]
						let ext = pathfind(pathless, prev, cursor.cell)
						if (ext && path.length + ext.length - 2 <= Unit.mov(unit)) {
							ext.shift() // exclude duplicate start cell
							path.push(...ext)
						} else {
							path = cache.path = pathfind(cells, unit.cell, cursor.cell)
						}
					}
				}
			} else if (target && !Unit.allied(unit, target)
			&& Cell.manhattan(dest, target.cell) > unit.equipment.weapon.rng
			) {
				let neighbors = Cell.neighborhood(target.cell, unit.equipment.weapon.rng)
				if (path) {
					for (var i = path.length; i--;) {
						let cell = path[i]
						if (target) {
							if (neighbors.find(neighbor => Cell.equals(cell, neighbor))) {
								path.splice(i + 1, path.length - i - 1)
								break
							}
						}
					}
				}
				if (!path || i === -1) {
					let dest = null
					for (let i = 0; i < range.move.length; i++) {
						let cell = range.move[i]
						if (neighbors.find(neighbor => Cell.equals(cell, neighbor))) {
							dest = cell
							break
						}
					}
					path = cache.path = pathfind(cells, unit.cell, dest)
				}
			}
		}

		if (path && (cursor.selection && !cache.moved || moving && time % 2)) {
			let arrow = sprites.ui.Arrow(path, cache.phase.faction)
			layers.arrows.push(...arrow.map(sprite => ({
				image: sprite.image,
				position: [ sprite.position[0] * 16, sprite.position[1] * 16 ]
			})))
		}

		if (cache.moved && !moving && !attacking && !dialogs.length) {
			let options = null
			let neighbors = Cell.neighborhood(cached.cell, cached.equipment.weapon.rng)
			let enemies = []
			for (let neighbor of neighbors) {
				let other = Map.unitAt(map, neighbor)
				if (other && !Unit.allied(unit, other)) {
					enemies.push(other)
				}
			}
			cache.enemies = enemies
			if (enemies.length) {
				options = [ "attack", "wait" ]
			} else {
				options = [ "wait" ]
			}
			dialogs.push({
				type: "actions",
				menu: Menu.create(options)
			})
			if (cache.target) {
				let target = cache.target.unit
				let index = enemies.indexOf(target)
				dialogs.unshift({
					type: "forecast",
					menu: Menu.create(enemies, index)
				})
				cursor.cell = target.cell.slice()
				cursor.prev = target.cell.slice()
			}
		}
	}

	if (view.state.paused) {
		if (!dialogs.length) {
			dialogs.push({
				type: "pause",
				menu: Menu.create([ "end turn" ])
			})
		} else {
			let menu = pause.menu
			if (menu.done) {
				let option = menu.options[menu.index]
				if (option === "end turn") {
					Game.nextPhase(game)
				}
				view.state.paused = false
				dialogs.shift()
			}
		}
	}

	let relative = cursor.cell[1] * 16 + 8 - viewport.target[1]
	let below = relative >= viewport.size[1] / 2

	// primary dialog, for hovered units and selections
	let selected = cursor.selection
		|| (attack && cache.selected)
		|| cursor.under

	let selectionDialog = cache.dialogs.selection
	if (selected && !(cache.selected && selected !== cache.selected)
	&& !phasing && !pause
	&& !(forecast && selectionDialog && selectionDialog.name.position[1] === 8)
	&& (!selectionDialog || forecast || attack || (
		!(below && !forecast && selectionDialog && selectionDialog.name.position[1] !== 8)
		&& !(!below && selectionDialog && selectionDialog.name.position[1] === 8)
		))
	) {
		if (!cache.selected) {
			cache.selected = selected
		}
		let unit = selected.unit
		let index = game.map.units.indexOf(unit)
		let cached = cache.units[index]
		if (!cache.dialogs.selection) {
			let y = viewport.size[1] - 68
			if (below && !forecast) {
				y = 0
			}

			let details = sprites.ui.UnitDetails(cached)
			cache.dialogs.selection = {
				name: {
					image: details.name,
					position: [ -details.name.width, y + 8 ]
				},
				hp: {
					image: details.hp,
					position: [ -details.hp.width, y + 36 ]
				}
			}
		}

		let { name, hp } = cache.dialogs.selection
		let y1 = 0
		let y2 = 0
		if (attack || visible) {
			y2 = viewport.size[1] - 4 - 36 - 4 - hp.image.height - 4
			y1 = y2 - 4 - name.image.height
		} else if (!below || forecast) {
			y2 = viewport.size[1] - 4 - hp.image.height - 4
			y1 = y2 - 4 - name.image.height
		}

		if (attack || !below || forecast) {
			name.position[1] += (y1 - name.position[1]) / 8
			hp.position[1]   += (y2 - hp.position[1]) / 8
		}

		if (selected) {
			if (selected.time >= 12) {
				name.position[0] += (8 - name.position[0]) / 8
			}
			if (selected.time >= 16) {
				hp.position[0] += (8 - hp.position[0]) / 8
			}
		}

		layers.ui.push(name, hp)
	} else if (cache.selected) {
		let unit = cache.selected.unit
		let details = cache.dialogs.selection
		if (details) {
			// move details out of view
			let { name, hp } = details
			if (name.position[0] > -name.image.width
			|| hp.position[0] > -hp.image.width
			) {
				name.position[0] -= 16
				hp.position[0] -= 16
			} else {
				cache.dialogs.selection = null
				cache.selected = null
			}
			layers.ui.push(name, hp)
		}
	}

	// secondary dialog, for targets
	let target = null
	let targetDialog = cache.dialogs.target
	if (forecast) {
		let menu = forecast.menu
		target = menu.options[menu.index]
		if (!cache.target) {
			target = cache.target = { unit: target, time: 0 }
		} else if (cache.target.unit !== target) {
			target = { unit: target, time: 0 }
		} else {
			target = cache.target
		}
		cursor.cell = target.unit.cell.slice()
	} else if (attack) {
		target = cache.target
	} else if (cursor.selection
		&& cache.phase.faction !== "enemy"
		&& cursor.under
		&& cursor.selection !== cursor.under
		&& !Unit.allied(cursor.selection.unit, cursor.under.unit)
	) {
		target = cursor.under
	}

	if (target && !(cache.target && target !== cache.target)
	&& !actions && !phasing
	&& !(forecast && targetDialog && targetDialog.name.position[1] === 8)
	) {
		if (!cache.target) {
			cache.target = target
		}
		let unit = target.unit
		if (!cache.dialogs.target) {
			let y = viewport.size[1] - 68
			if (below && !forecast) {
				y = 0
			}

			let details = sprites.ui.UnitDetails(unit)
			cache.dialogs.target = {
				name: {
					image: details.name,
					position: [ viewport.size[0], y + 8 ]
				},
				hp: {
					image: details.hp,
					position: [ viewport.size[0], y + 36 ]
				}
			}
		}

		let { name, hp } = cache.dialogs.target
		let y1 = 0
		let y2 = 0
		if (attack || visible) {
			y2 = viewport.size[1] - 8 - 36 - 4 - hp.image.height
			y1 = y2 - 4 - name.image.height
		} else if (!below || forecast) {
			y2 = viewport.size[1] - 8 - hp.image.height
			y1 = y2 - 4 - name.image.height
		}

		if (attack || !below || forecast) {
			name.position[1] += (y1 - name.position[1]) / 8
			hp.position[1]   += (y2 - hp.position[1]) / 8
		}

		if (target) {
			if (target.time >= 12) {
				let x = viewport.size[0] - 8 - name.image.width
				name.position[0] += (x  - name.position[0]) / 8
			}
			if (target.time >= 16) {
				let x = viewport.size[0] - 8 - hp.image.width
				hp.position[0] += (x - hp.position[0]) / 8
			}
		}

		layers.ui.push(name, hp)
	} else if (cache.target) {
		let unit = cache.target.unit
		let details = cache.dialogs.target
		if (details) {
			// move details out of view
			let { name, hp } = details
			if (name.position[0] < viewport.size[0]
			|| hp.position[0] < viewport.size[0]
			) {
				name.position[0] += 16
				hp.position[0] += 16
			} else {
				cache.dialogs.target = null
				cache.target = null
			}
			layers.ui.push(name, hp)
		}
	}

	// attack animation
	if (attack && !phasing) {
		let { attacker, target, power, damage } = attack
		let index = map.units.indexOf(attacker)
		let cached = cache.units[index]
		if (!cache.attack) {
			cache.attack = {
				countdown: 7,
				time: 0,
				connected: false,
				normal: null
			}
			if (cache.phase.faction === "player" && attacker.faction === "player") {
				let anim = Anim("drop", cached, Anims.drop())
				anims.push(anim)
			}
			if (!attack.counter) {
				log.push(`${attacker.name} attacks`)
			} else {
				log.push(`${attacker.name} counters -`)
			}
		} else if (cache.attack.countdown) {
			if (!--cache.attack.countdown) {
				let anim = Anim("attack", cached, Anims.attack(attacker.cell, target.cell))
				anims.push(anim)
				cache.attack.normal = anim.data.norm
			}
		}

		if (anim && anim.type === "attack" && anim.data.connected) {
			if (!cache.attack.connected) {
				cache.attack.connected = true
				if (power === null) {
					let p = target.faction === "player"
						? "."
						: "!"
					log.push(`${target.name} dodges the attack${p}`)
				} else if (power === 0) {
					let p = target.faction === "player"
						? "."
						: "!"
					log.push(`${target.name} blocks the attack${p}`)
				} else {
					let p = damage === 3
						? "!!"
						: "."
					log.push(`${target.name} suffers ${damage} damage${p}`)
				}
			}
		}

		if (cache.attack && cache.attack.connected) {
			let time = cache.attack.time
			if (time >= 45 && !target.hp && map.units.includes(target)) {
				// remove dead unit from map
				let index = map.units.indexOf(target)
				map.units.splice(index, 1)

				if (target.faction === "player") {
					log.push(`${target.name} is defeated.`)
				} else if (target.faction === "enemy") {
					log.push(`Defeated ${target.name}.`)
				}
			}

			// visually decrease health
			let details = attack.counter
				? cache.dialogs.selection
				: cache.dialogs.target
			if (details) {
				let canvas = details.hp.image
				let context = canvas.getContext("2d")
				let width = 0
				if (time * 2 <= damage * 14) {
					width = Math.min(damage * 14, time * 2)
					context.fillStyle = red
				} else {
					width = time - damage * 14
					context.fillStyle = "black"
				}
				if (width > 0 && width <= damage * 14) {
					context.fillRect(31 + (target.hp + damage) * 14 - width, 11, width, 2)
				}
			}

			if (time >= 60 && target.hp || time >= 75) {
				attacks.shift()
				cache.attack = null
				if (target.hp) {
					let index = game.map.units.indexOf(target)
					let cached = cache.units[index]
					cached.hp = target.hp
				}
				if (!attack.counter && cache.phase.faction === "player") {
					Game.endTurn(game, attacker)
					cursor.cell = attacker.cell.slice()
					cursor.prev = attacker.cell.slice()
				}
			} else {
				// particles
				if (time === 1) {
					let disp = [ target.cell[0] - attacker.cell[0], target.cell[1] - attacker.cell[1] ]
					let dist = Math.sqrt(disp[0] * disp[0] + disp[1] * disp[1])
					let norm = [ disp[0] / dist, disp[1] / dist ]
					let radians = Math.atan2(disp[1], disp[0])
					let origin = [ target.cell[0] * 16 + 8 - norm[0] * 4, target.cell[1] * 16 + 8 - norm[1] * 4 ]
					let total = damage / 3 * 48
					for (let i = 0; i < total; i++) {
						let size = "small"
						if (Math.random() < 0.25) {
							size = "large"
						}
						let sprite = sprites.effects[size]
						let normal = radians + Math.random() * 1 - 0.5
						let velocity = [
							-Math.cos(normal) * Math.random() * 2,
							-Math.sin(normal) * Math.random() * 2
						]
						cache.particles.push({
							position: origin.slice(),
							velocity: velocity,
							image: sprite,
							time: 0
						})
					}
				}

				if (time <= 45) {
					// battle result
					let value = cache.attack.value
					if (!value) {
						let text = null
						if (power === null) {
							text = "MISS"
						} else if (power === 0) {
							text = "0"
						} else if (power === 3) {
							text = "3!!"
						} else {
							text = power.toString()
						}
						value = cache.attack.value = {
							offset: 0,
							velocity: -2,
							image: sprites.ui.Text(text)
						}
					} else {
						value.offset += value.velocity
						value.velocity += 0.25
						if (value.offset > 0) {
							value.offset = 0
							value.velocity *= -1 / 3
						}
					}
					layers.effects.push({
						image: value.image,
						position: [
							target.cell[0] * 16 + 8 - value.image.width / 2,
							target.cell[1] * 16 - 12 + value.offset
						]
					})
				}
			}
		}
	}

	let particles = cache.particles
	for (let i = 0; i < particles.length; i++) {
		let particle = particles[i]
		particle.time++
		particle.position[0] += particle.velocity[0]
		particle.position[1] += particle.velocity[1]
		particle.velocity[0] *= 0.875
		particle.velocity[1] *= 0.875
		let percent = Math.random()
		layers.effects.push(particle)
		/*
		if (percent >= particle.time / 60) {
		}*/
		if (percent < particle.time / 240) {
			particles.splice(i--, 1)
		}
	}

	if (actions) {
		let menu = actions.menu
		if (menu.done) {
			let selection = menu.options[menu.index]
			if (selection === "wait") {
				let unit = cursor.selection.unit
				let index = map.units.indexOf(unit)
				let cached = cache.units[index]
				unit.cell = cached.cell
				cursor.selection = null
				cache.selection = null
				cache.squares.length = 0
				cache.ranges.length = 0
				cache.moved = false
				anim.done = true
				anims.push(
					Anim("drop", anim.target, Anims.drop(anim.data.height))
				)
				Game.endTurn(game, unit)
				cursor.cell = unit.cell.slice()
				cursor.prev = unit.cell.slice()
				dialogs.shift()
			} else if (selection === "attack") {
				dialogs.unshift({
					type: "forecast",
					menu: Menu.create(cache.enemies)
				})
			}
		}
	}

	let menu = view.state.menu
	if (pause || actions || forecast && forecast.menu.options.length > 1) {
		let data = null
		if (pause) {
			data = pause.menu
		} else if (forecast) {
			data = forecast.menu
		} else if (actions) {
			data = actions.menu
		}
		if (!menu) {
			menu = view.state.menu = {
				data: data,
				box: {
					size: [ 0, 0 ],
					targetSize: null,
					element: {
						image: null,
						position: [ 144, 48 ]
					}
				},
				cursor: null
			}
		}

		let box = menu.box
		if (menu.data !== data || !box.targetSize) {
			// menu contents have changed OR no target size is specified
			// reset contents and recalculate target size
			cache.menu.labels.length = 0
			menu.cursor = null
			menu.data = data
			let options = data.options
			if (forecast) {
				options = options.map(unit => unit.name)
			}
			let widest = null
			for (let option of options) {
				let text = forecast ? option : option.toUpperCase()
				let image = sprites.ui.Text(text)
				if (!widest || image.width > widest.width) {
					widest = image
				}
				cache.menu.labels.push(image)
			}
			box.size = [ 0, 0 ]
			box.targetSize = [
				widest.width + 36,
				menu.data.options.length * 16 + 16
			]
		}
		// resize dialog box to target size
		box.size[0] += (box.targetSize[0] - box.size[0]) / 4
		box.size[1] += (box.targetSize[1] - box.size[1]) / 4
	} else {
		if (menu) {
			let box = menu.box
			// shrink box until it hits size [ 0, 0 ]
			if (box.size[0]) {
				box.size[0] -= Math.min(box.size[0], box.targetSize[0] / 5)
				box.size[1] -= Math.min(box.size[1], box.targetSize[1] / 5)
			}
		}
	}



	if (menu) {
		let box = menu.box
		if (box.size[0] && box.size[1]) {
			// only draw if side lengths are not 0
			let dist = box.targetSize[0] - box.size[0]
			box.element.image = sprites.ui.Box(...box.size.map(Math.round))
			cache.menu.box = box.element.image
			if (dist < 4) {
				// box is large enough. draw contents
				let context = box.element.image.getContext("2d")
				for (let i = 0; i < cache.menu.labels.length; i++) {
					let label = cache.menu.labels[i]
					context.drawImage(label, 24, 12 + i * 16)
				}
				let symbol = null
				let option = menu.data.options[menu.data.index]
				if (option === "attack") {
					symbol = sprites.ui.symbols.sword
				} else if (option === "wait") {
					symbol = sprites.ui.symbols.clock
				} else if (option === "end turn") {
					symbol = sprites.ui.symbols.next
				} else if (forecast) {
					symbol = sprites.ui.symbols.sword
				}

				if (symbol) {
					let frame = (time % 180) / 180
					let offset = Math.sin(2 * Math.PI * frame * 2)
					let y = 12 + menu.data.index * 16 - offset
					if (menu.cursor === null) {
						menu.cursor = y
					} else {
						menu.cursor += (y - menu.cursor) / 2
					}
					context.drawImage(symbol, 12, menu.cursor)
				}
			}
			layers.ui.push(box.element)
		}
	}


	if (forecast) {
		let menu = forecast.menu
		let target = menu.options[menu.index]
		if (!cache.dialogs.forecast) {
			let text = sprites.ui.Text("COMBAT FORECAST")
			let box = sprites.ui.Box(text.width + 28, 24)
			let context = box.getContext("2d")
			let symbol = sprites.ui.symbols.eye
			context.drawImage(symbol, 8, 8)
			context.drawImage(text, 20, 8)
			cache.dialogs.forecast = {
				title: {
					image: box,
					position: [ -box.width, 8 ]
				}
			}
		}
		let title = cache.dialogs.forecast.title
		title.position[0] += (8 - title.position[0]) / 8
		layers.ui.push(title)

		let unit = cursor.selection.unit
		let index = map.units.indexOf(unit)
		let cached = view.cache.units[index]
		let neighbors = Cell.neighborhood(cached.cell, unit.equipment.weapon.rng)
		for (let neighbor of neighbors) {
			layers.squares.push({
				image: sprites.ui.squares.attack,
				position: [ neighbor[0] * 16, neighbor[1] * 16 ]
			})
		}

		if (dialog.time === undefined) {
			dialog.time = 0
		} else {
			dialog.time++
		}

		let x = 31
		let y = 11
		let n = Math.floor(42 / 3)
		let a = Math.sin(dialog.time % 60 / 60 * Math.PI) * 255
		let steps = Cell.manhattan(cached.cell, target.cell)

		let finisher = false
		let targetDialog = cache.dialogs.target
		if (targetDialog) {
			let damage = Math.min(target.hp,
				steps <= unit.equipment.weapon.rng
					? Number(Unit.dmg(unit, target))
					: 0
			)
			if (damage) {
				if (target.hp - damage <= 0) {
					finisher = true
				}
				let context = Canvas(damage * n, 2)
				context.fillStyle = `rgb(${a}, ${a}, ${a})`
				context.fillRect(0, 0, context.canvas.width, context.canvas.height)
				layers.ui.push({
					image: context.canvas,
					position: [
						targetDialog.hp.position[0] + x + (target.hp - damage) * n,
						targetDialog.hp.position[1] + y
					]
				})
			}
		}

		if (!finisher) {
			let unitDialog = cache.dialogs.selection
			if (unitDialog) {
				let damage = Math.min(unit.hp,
					steps <= target.equipment.weapon.rng
						? Number(Unit.dmg(target, unit))
						: 0
				)
				if (damage) {
					let context = Canvas(damage * n, 2)
					context.fillStyle = `rgb(${a}, ${a}, ${a})`
					context.fillRect(0, 0, context.canvas.width, context.canvas.height)
					layers.ui.push({
						image: context.canvas,
						position: [
							unitDialog.hp.position[0] + x + (unit.hp - damage) * n,
							unitDialog.hp.position[1] + y
						]
					})
				}
			}
		}

		if (menu.done) {
			unit.cell = cached.cell
			let power = Unit.dmg(unit, target)
			let damage = Math.min(target.hp, Number(power))
			Unit.attack(unit, target)
			attacks.push({
				attacker: unit,
				target: target,
				power: power,
				damage: damage,
			})
			if (!finisher && steps <= target.equipment.weapon.rng) {
				let power = Unit.dmg(target, unit)
				let damage = Math.min(unit.hp, Number(power))
				Unit.attack(target, unit)
				attacks.push({
					attacker: target,
					target: unit,
					power: power,
					damage: damage,
					counter: true
				})
			}
			cache.squares.length = 0
			cache.ranges.length = 0
			cache.moved = false
			cursor.selection = null
			cache.selection = null
			dialogs.length = 0
			anim.done = true
		}
	} else {
		let dialog = cache.dialogs.forecast
		if (dialog) {
			let title = dialog.title
			if (title.position[0] > -title.image.width) {
				title.position[0] -= Math.max(16, -title.image.width - title.position[0])
				layers.ui.push(title)
			} else {
				cache.dialogs.forecast = null
			}
		}
	}

	let objective = cache.dialogs.objective
	if (!objective) {
		let title = sprites.ui.TextBox("OBJECTIVE")
		let body = sprites.ui.TextBox("Defeat Nergal")
		objective = cache.dialogs.objective = {
			lastUpdate: null,
			time: 0,
			title: {
				image: title,
				position: [ viewport.size[0], viewport.size[1] - title.height - 36 ]
			},
			body: {
				image: body,
				position: [ viewport.size[0], viewport.size[1] - body.height - 8 ]
			}
		}
	}

	if (map.units.length !== objective.lastUpdate) {
		objective.body.image = sprites.ui.TextBox(`Defeat Nergal`)
		objective.lastUpdate = enemies.length
	}

	let { title, body } = objective
	if (!cursor.selection && !cursor.under
	&& !cache.attack && !pause
	&& Cell.manhattan(cursor.cell, cursor.prev) < 1e-3
	&& (below === (title.position[1] === 8)
		|| title.position[0] === viewport.size[0]
		&& body.position[0] === viewport.size[0]
		)
	) {
		if (!objective.time) {
			objective.time = 1
		}
	} else {
		objective.time = 0
	}

	let idle = 150
	if (objective.time) {
		if (title.position[0] === viewport.size[0]) {
			if (below) {
				title.position[1] = 8
				body.position[1] = 36
			} else {
				title.position[1] = viewport.size[1] - title.image.height - 36
				body.position[1] = viewport.size[1] - body.image.height - 8
			}
		}
		if (++objective.time >= idle) {
			title.position[0] += ((viewport.size[0] - title.image.width - 8) - title.position[0]) / 8
		}
		if (objective.time >= idle + 4) {
			body.position[0] += ((viewport.size[0] - body.image.width - 8) - body.position[0]) / 8
		}
	}

	if (objective.time < idle) {
		if (title.position[0] < viewport.size[0]
		|| body.position[0] < viewport.size[0]
		) {
			title.position[0] += Math.min(16, viewport.size[0] - title.position[0])
			body.position[0] += Math.min(16, viewport.size[0] - body.position[0])
			objective.time = 0
		}
	}

	layers.ui.push(title, body)

	if (phasing) {
		let x = 0
		let data = anim.data
		let text = sprites.ui.phases[anim.target]
		if (data.state === "enter") {
			let origin = -text.width
			let target = viewport.size[0] / 2 - text.width / 2 - 3
			x = data.text.x * (target - origin) + origin
		} else if (data.state === "pass") {
			let origin = viewport.size[0] / 2 - text.width / 2 - 3
			x = data.text.x * 6 + origin
		} else if (data.state === "exit") {
			let origin = viewport.size[0] / 2 - text.width / 2 + 3
			let target = viewport.size[0]
			x = data.text.x * (target - origin) + origin
		}

		let bg = Canvas(256 * (data.bg.width - data.bg.x), 2 + 10 * data.bg.height)
		bg.fillStyle = anim.target === "player"
			? blue
			: red
		bg.fillRect(0, 0, bg.canvas.width, bg.canvas.height)

		if (bg.canvas.width) {
			layers.ui.push({
				image: bg.canvas,
				position: [ data.bg.x * 256, viewport.size[1] / 2 - bg.canvas.height / 2 ]
			})
		}

		layers.ui.push({
			image: text,
			position: [ x, viewport.size[1] / 2 - text.height / 2 ]
		})
	}

	if (cache.attack && attack.power === 3 && cache.attack.time === 1) {
		context.fillStyle = "white"
		context.fillRect(0, 0, context.canvas.width, context.canvas.height)
	} else {
		if (cache.phase.faction === "player"
		&& !attack && !pause && !phasing
		&& (!actions && !cache.moved || forecast)
		) {
			renderCursor(layers, sprites.ui.cursor, cursor, view)
		}

		renderUnits(layers, sprites.pieces, game, view)
		renderLayers(layers, order, viewport, context)
	}
}

function free(col) {
	return (col + 0.5) * 16
}

function snap(x) {
	return Math.floor(x / 16)
}

function renderSquares(layers, sprites, squares) {
	for (let square of squares) {
		let sprite = square.sprite
		let x = square.cell[0] * 16
		let y = square.cell[1] * 16
		layers.squares.push({
			image: sprite,
			position: [ x, y ]
		})
	}
}

function drawMap(map, sprites) {
	let cols = Map.width(map)
	let rows = Map.height(map)
	let floors = Canvas(cols * 16, rows * 16)
	let walls = Canvas(cols * 16, rows * 16)
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			let x = col * 16
			let y = row * 16
			let tile = Map.tileAt(map, [ col, row ])
			let sprite = null
			if (tile.name === "wall") {
				if (row + 1 < rows && Map.tileAt(map, [ col, row + 1 ]).name !== "wall") {
					sprite = sprites["wall-base"]
				} else {
					sprite = sprites.wall
				}
				walls.drawImage(sprite, x, y)
			} else {
				let shadow = null
				if (col - 1 >= 0 && Map.tileAt(map, [ col - 1, row ]).name === "wall"
				&& row - 1 >= 0 && Map.tileAt(map, [ col - 1, row - 1 ]).name !== "wall"
				) {
					shadow = sprites["shadow-corner"]
				} else if (col - 1 >= 0 && Map.tileAt(map, [ col - 1, row ]).name === "wall") {
					shadow = sprites["shadow-edge"]
				}
				sprite = sprites[tile.name]
				floors.drawImage(sprite, x, y)
				if (shadow) {
					floors.drawImage(shadow, x, y)
				}
			}
		}
	}
	return {
		floors: floors.canvas,
		walls: walls.canvas
	}
}

function renderUnits(layers, sprites, game, view) {
	let map = game.map
	let phase = game.phase
	let cache = view.cache
	let attacks = view.state.attacks
	let anims = view.state.anims
	let anim = anims[0]
	for (let i = 0; i < cache.units.length; i++) {
		let unit = cache.units[i]
		let real = unit.original
		let cell = unit.cell
		let x = cell[0] * 16
		let y = cell[1] * 16
		let z = 0
		let sprite = sprites[unit.faction][symbols[unit.type]]
		if (unit.faction === "player"
		&& cache.phase.faction === "player"
		&& cache.phase.pending
		&& !cache.phase.pending.includes(real)
		&& !(attacks.length && attacks[0].target === real)
		&& !(anim && anim.target === unit && (anim.type === "move" || anim.type === "attack"))
		) {
			sprite = sprites.done[unit.faction][symbols[unit.type]]
		}
		if (map.units[i] === real) {
			if (!Cell.equals(unit.cell, real.cell)
			&& !cache.moved
			) {
				if (anim) anim.done = true
				anim = anims[0] = Anim("move", unit, Anims.move(cache.path))
				cache.moved = true
			}
		} else if (!anims.length) {
			if (anim) anim.done = true
			anim = anims[0] = Anim("fade", unit, Anims.fade())
		}
		if (anim && anim.target === unit) {
			if (anim.type === "lift" || anim.type === "drop") {
				z = anim.data.height
			} else if (anim.type === "move" || anim.type === "attack") {
				x = anim.data.cell[0] * 16
				y = anim.data.cell[1] * 16
			} else if (anim.type === "fade") {
				if (anim.done) {
					cache.units.splice(i--, 1)
					continue
				} else if (!anim.data.visible) {
					continue
				}
			}
			layers.selection.push({
				image: sprite,
				position: [ x, y - z ]
			})
		} else {
			let attack = attacks[0]
			if (cache.attack && !cache.attack.countdown) {
				if (attack.target === real) {
					let { connected, time, normal } = cache.attack
					if (connected) {
						if (attack.damage && time < 45 && time % 2) {
							sprite = sprites.flashing
						}
						if (time < 20 && attack.power
						&& (unit.type !== "knight" || attack.damage === unit.hp)
						) {
							let steps = time
							if (time > 10) {
								steps = 20 - time
							}
							x += normal[0] * steps / 2 * attack.power / 2
							y += normal[1] * steps / 2 * attack.power / 2
						}
					}
					layers.selection.unshift({
						image: sprite,
						position: [ x, y ]
					})
				}
			}
			if (!cache.attack || cache.attack.countdown || attack && attack.target !== real) {
				layers.pieces.push({
					image: sprite,
					position: [ x, y ]
				})
			}
		}
		layers.shadows.push({
			image: sprites.shadow,
			position: [ x + 1, y + 4 ]
		})
	}
}

function renderCursor(layers, sprites, cursor, view) {
	let time = view.state.time
	let cache = view.cache
	let dx = cursor.cell[0] - cursor.prev[0]
	let dy = cursor.cell[1] - cursor.prev[1]
	let d = Math.abs(dx) + Math.abs(dy)
	cursor.prev[0] += dx / 4
	cursor.prev[1] += dy / 4

	let frame = 0
	if (cursor.selection && !view.state.dialogs.length) {
		frame = 1
	} else if (d < 1e-3) {
		frame = Math.floor(time / 30) % 2
	}

	let x = cursor.prev[0] * 16
	let y = cursor.prev[1] * 16
	let sprite = sprites[view.cache.phase.faction][frame]
	layers.cursor.push({
		image: sprite,
		position: [ x, y ]
	})
}

function renderLayers(layers, order, viewport, context) {
	for (let name of order) {
		let layer = layers[name]
		if (name !== "ui") {
			layer.sort((a, b) => a.position[1] - b.position[1])
		}

		for (let element of layer) {
			let x = Math.round(element.position[0])
			let y = Math.round(element.position[1] - (element.position[2] || 0))
			if (name !== "ui") {
				x -= (viewport.position[0] + viewport.offset[0])
				y -= (viewport.position[1] + viewport.offset[1])
			}
			context.drawImage(element.image, x, y)
		}
	}
}
