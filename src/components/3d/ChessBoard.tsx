import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Square, PieceSymbol } from 'chess.js';
import type { BoardTheme } from '../../types/theme';
import { ChessPiece } from './ChessPiece';
import type { PieceType, PieceColor } from '../../types/chess';
import { squareToCoords, FILES, RANKS } from '../../utils/chessCoords';
import { createMarbleTexture, createObsidianTexture } from '../../utils/proceduralTextures';

interface ChessBoardProps {
  board: ({ square: Square; type: PieceSymbol; color: 'w' | 'b' } | null)[][];
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  isCheck: boolean;
  turn: 'w' | 'b';
  showLegalMoves: boolean;
  showCoordinates: boolean;
  theme: BoardTheme;
  onSquareClick: (square: Square) => void;
}

// Generate an offline canvas texture for board rank/file coordinate labels
function createLabelTexture(text: string, color: string = '#94a3b8'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = color;
    ctx.font = 'bold 36px "JetBrains Mono", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 34);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  isCheck,
  turn,
  showLegalMoves,
  showCoordinates,
  theme,
  onSquareClick,
}) => {
  // Find King square if currently in check
  const checkKingSquare = useMemo(() => {
    if (!isCheck) return null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return piece.square;
        }
      }
    }
    return null;
  }, [isCheck, board, turn]);

  // Procedural marble & obsidian maps for squares
  const marbleTexture = useMemo(() => createMarbleTexture(512, 512), []);
  const obsidianTexture = useMemo(() => createObsidianTexture(512, 512), []);

  const isWizardsTheme = theme.id === 'wizards_sanctuary';

  // Physical materials for squares with high clearcoat (0.92) & crisp reflections
  const lightSquareMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(theme.lightSquare),
      map: isWizardsTheme ? marbleTexture : undefined,
      roughness: theme.lightSquareRoughness,
      metalness: theme.lightSquareMetalness,
      clearcoat: isWizardsTheme ? 0.92 : 0.3,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
  }, [theme.lightSquare, theme.lightSquareRoughness, theme.lightSquareMetalness, isWizardsTheme, marbleTexture]);

  const darkSquareMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(theme.darkSquare),
      map: isWizardsTheme ? obsidianTexture : undefined,
      roughness: theme.darkSquareRoughness,
      metalness: theme.darkSquareMetalness,
      clearcoat: isWizardsTheme ? 0.94 : 0.3,
      clearcoatRoughness: 0.1,
      reflectivity: 0.95,
    });
  }, [theme.darkSquare, theme.darkSquareRoughness, theme.darkSquareMetalness, isWizardsTheme, obsidianTexture]);

  const selectedSquareMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.selectedColor),
      roughness: 0.2,
      metalness: 0.3,
      emissive: new THREE.Color(theme.selectedColor),
      emissiveIntensity: 0.45,
    });
  }, [theme.selectedColor]);

  const lastMoveSquareMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.accentColor),
      roughness: 0.3,
      metalness: 0.2,
      emissive: new THREE.Color(theme.accentColor),
      emissiveIntensity: 0.25,
    });
  }, [theme.accentColor]);

  const checkSquareMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.checkColor),
      emissive: new THREE.Color(theme.checkColor),
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
  }, [theme.checkColor]);

  // Pre-generate coordinate textures
  const coordTextures = useMemo(() => {
    const map: Record<string, THREE.CanvasTexture> = {};
    FILES.forEach((f) => {
      map[f] = createLabelTexture(f.toUpperCase(), theme.accentColor);
    });
    RANKS.forEach((r) => {
      map[r] = createLabelTexture(r, theme.accentColor);
    });
    return map;
  }, [theme.accentColor]);

  // Flattened list of active pieces on board
  const pieces = useMemo(() => {
    const list: {
      key: string;
      square: Square;
      type: PieceType;
      color: PieceColor;
      position: [number, number, number];
    }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          list.push({
            key: `${piece.square}-${piece.type}-${piece.color}`,
            square: piece.square,
            type: piece.type as PieceType,
            color: piece.color as PieceColor,
            position: squareToCoords(piece.square),
          });
        }
      }
    }
    return list;
  }, [board]);

  return (
    <group position={[0, 0, 0]}>
      {/* --- Board Wooden/Metallic Chassis Frame --- */}
      {/* Outer base plinth */}
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[9.4, 0.32, 9.4]} />
        <meshStandardMaterial
          color={theme.boardFrame}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Decorative metal inlay trim */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[8.4, 0.04, 8.4]} />
        <meshStandardMaterial
          color={theme.boardTrim}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Raised inner board bevel */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[8.16, 0.06, 8.16]} />
        <meshStandardMaterial
          color={theme.boardBevel}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>

      {/* --- 64 Board Squares --- */}
      {FILES.map((file, fileIdx) =>
        RANKS.map((rank, rankIdx) => {
          const square = `${file}${rank}` as Square;
          const isDark = (fileIdx + rankIdx) % 2 === 0;
          const isSelected = selectedSquare === square;
          const isLegalMove = showLegalMoves && legalMoves.includes(square);
          const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
          const isCheckSquare = checkKingSquare === square;

          // Check if square currently has a piece
          const hasPiece = pieces.some((p) => p.square === square);

          const x = fileIdx - 3.5;
          const z = 3.5 - rankIdx;

          // Choose tile material
          let squareMaterial: THREE.Material = isDark ? darkSquareMat : lightSquareMat;
          if (isCheckSquare) {
            squareMaterial = checkSquareMat;
          } else if (isSelected) {
            squareMaterial = selectedSquareMat;
          } else if (isLastMove) {
            squareMaterial = lastMoveSquareMat;
          }

          return (
            <group key={square} position={[x, 0.05, z]}>
              {/* Individual Chamfered Square Tile */}
              <mesh
                receiveShadow
                material={squareMaterial}
                onClick={(e) => {
                  e.stopPropagation();
                  onSquareClick(square);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'default';
                }}
              >
                <boxGeometry args={[0.98, 0.08, 0.98]} />
              </mesh>

              {/* Legal Move Indicator on Empty Square (Glowing target dot) */}
              {isLegalMove && !hasPiece && (
                <mesh
                  position={[0, 0.05, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSquareClick(square);
                  }}
                >
                  <circleGeometry args={[0.16, 24]} />
                  <meshStandardMaterial
                    color={theme.legalMoveColor}
                    emissive={theme.legalMoveColor}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.85}
                  />
                </mesh>
              )}

              {/* Legal Move Indicator on Enemy Square (Target Ring) */}
              {isLegalMove && hasPiece && (
                <mesh
                  position={[0, 0.051, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSquareClick(square);
                  }}
                >
                  <ringGeometry args={[0.38, 0.46, 32]} />
                  <meshStandardMaterial
                    color={theme.captureMoveColor}
                    emissive={theme.captureMoveColor}
                    emissiveIntensity={0.9}
                    transparent
                    opacity={0.9}
                  />
                </mesh>
              )}
            </group>
          );
        })
      )}

      {/* --- Board Edge Coordinate Labels (A-H & 1-8) --- */}
      {showCoordinates && (
        <group>
          {/* File Labels: Near Edge (Rank 1 border) & Far Edge (Rank 8 border) */}
          {FILES.map((file, idx) => {
            const x = idx - 3.5;
            const tex = coordTextures[file];
            return (
              <React.Fragment key={`file-${file}`}>
                {/* Near (White side) */}
                <mesh position={[x, 0.06, 4.3]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.4, 0.4]} />
                  <meshBasicMaterial map={tex} transparent opacity={0.75} />
                </mesh>
                {/* Far (Black side) */}
                <mesh position={[x, 0.06, -4.3]} rotation={[-Math.PI / 2, 0, Math.PI]}>
                  <planeGeometry args={[0.4, 0.4]} />
                  <meshBasicMaterial map={tex} transparent opacity={0.75} />
                </mesh>
              </React.Fragment>
            );
          })}

          {/* Rank Labels: Left Edge (A border) & Right Edge (H border) */}
          {RANKS.map((rank, idx) => {
            const z = 3.5 - idx;
            const tex = coordTextures[rank];
            return (
              <React.Fragment key={`rank-${rank}`}>
                {/* Left */}
                <mesh position={[-4.3, 0.06, z]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                  <planeGeometry args={[0.4, 0.4]} />
                  <meshBasicMaterial map={tex} transparent opacity={0.75} />
                </mesh>
                {/* Right */}
                <mesh position={[4.3, 0.06, z]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
                  <planeGeometry args={[0.4, 0.4]} />
                  <meshBasicMaterial map={tex} transparent opacity={0.75} />
                </mesh>
              </React.Fragment>
            );
          })}
        </group>
      )}

      {/* --- Chess Pieces --- */}
      {pieces.map((piece) => {
        const isSelected = selectedSquare === piece.square;
        const isLegalTarget = showLegalMoves && legalMoves.includes(piece.square);

        return (
          <ChessPiece
            key={piece.key}
            type={piece.type}
            color={piece.color}
            position={piece.position}
            isSelected={isSelected}
            isLegalTarget={isLegalTarget}
            theme={theme}
            onClick={() => onSquareClick(piece.square)}
          />
        );
      })}
    </group>
  );
};
