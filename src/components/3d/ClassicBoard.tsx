import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Square, PieceSymbol } from 'chess.js';
import type { PieceType, PieceColor } from '../../types/chess';
import { squareToCoords, FILES, RANKS } from '../../utils/chessCoords';
import { createMapleTexture, createWalnutTexture } from '../../utils/woodTextures';
import { HighPolyPiece } from './HighPolyPieces';

interface ClassicBoardProps {
  board: ({ square: Square; type: PieceSymbol; color: 'w' | 'b' } | null)[][];
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  isCheck: boolean;
  turn: 'w' | 'b';
  onSquareClick: (square: Square) => void;
}

export const ClassicBoard: React.FC<ClassicBoardProps> = ({
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  isCheck,
  turn,
  onSquareClick,
}) => {
  // Procedural wood textures
  const mapleTex = useMemo(() => createMapleTexture(512, 512), []);
  const walnutTex = useMemo(() => createWalnutTexture(512, 512), []);

  // Polished wood materials with clear visual contrast:
  // Light squares: #e8c89b (warm cream/maple), Dark squares: #4a2a18 (rich French walnut)
  const mapleMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e8c89b'),
      map: mapleTex,
      roughness: 0.18,
      metalness: 0.04,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      reflectivity: 0.92,
    });
  }, [mapleTex]);

  const walnutMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#4a2a18'),
      map: walnutTex,
      roughness: 0.2,
      metalness: 0.08,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
      reflectivity: 0.95,
    });
  }, [walnutTex]);

  // Selected Square Golden Glow Material (subtle golden glow beneath the piece)
  const selectedSquareMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d4af37'),
      emissive: new THREE.Color('#f59e0b'),
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.4,
    });
  }, []);

  // Last move subtle highlight
  const lastMoveMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#b45309'),
      emissive: new THREE.Color('#d97706'),
      emissiveIntensity: 0.25,
      roughness: 0.3,
    });
  }, []);

  // King in check red warning
  const checkMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e11d48'),
      emissive: new THREE.Color('#be123c'),
      emissiveIntensity: 0.65,
      roughness: 0.2,
    });
  }, []);

  // Find King square if in check
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

  // Active pieces on the board
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
      {/* --- Heavy Solid Walnut Wooden Board Chassis --- */}
      {/* Outer base plinth with beveled edges */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[9.4, 0.3, 9.4]} />
        <meshPhysicalMaterial
          color="#2e190e"
          map={walnutTex}
          roughness={0.25}
          metalness={0.08}
          clearcoat={0.9}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* Engraved Inset Brass/Gold Trim Groove */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[8.46, 0.04, 8.46]} />
        <meshStandardMaterial color="#b4832c" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Inner board raised lip */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[8.2, 0.05, 8.2]} />
        <meshPhysicalMaterial
          color="#381e11"
          map={walnutTex}
          roughness={0.2}
          clearcoat={0.95}
        />
      </mesh>

      {/* --- 64 Interactive Wooden Squares --- */}
      {FILES.map((file, fileIdx) =>
        RANKS.map((rank, rankIdx) => {
          const square = `${file}${rank}` as Square;
          const isDark = (fileIdx + rankIdx) % 2 === 0;
          const isSelected = selectedSquare === square;
          const isLegalMove = legalMoves.includes(square);
          const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
          const isCheckSquare = checkKingSquare === square;
          const hasPiece = pieces.some((p) => p.square === square);

          const x = fileIdx - 3.5;
          const z = 3.5 - rankIdx;

          let squareMaterial: THREE.Material = isDark ? walnutMaterial : mapleMaterial;
          if (isCheckSquare) {
            squareMaterial = checkMaterial;
          } else if (isSelected) {
            squareMaterial = selectedSquareMaterial;
          } else if (isLastMove) {
            squareMaterial = lastMoveMaterial;
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

              {/* Subtle Golden Glow Disc beneath selected piece */}
              {isSelected && (
                <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.28, 0.46, 32]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    emissive="#d97706"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.85}
                  />
                </mesh>
              )}

              {/* Legal Move Indicator on Empty Square (Gentle warm amber target dot) */}
              {isLegalMove && !hasPiece && (
                <mesh
                  position={[0, 0.052, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSquareClick(square);
                  }}
                >
                  <circleGeometry args={[0.15, 24]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    emissive="#f59e0b"
                    emissiveIntensity={0.65}
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              )}

              {/* Legal Move Indicator on Enemy Square (Target Capture Ring) */}
              {isLegalMove && hasPiece && (
                <mesh
                  position={[0, 0.053, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSquareClick(square);
                  }}
                >
                  <ringGeometry args={[0.38, 0.46, 32]} />
                  <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
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

      {/* --- Finely Sculpted High-Subdivision Staunton Pieces --- */}
      {pieces.map((piece) => {
        const isSelected = selectedSquare === piece.square;
        const isLegalTarget = legalMoves.includes(piece.square);

        return (
          <HighPolyPiece
            key={piece.key}
            type={piece.type}
            color={piece.color}
            position={piece.position}
            isSelected={isSelected}
            isLegalTarget={isLegalTarget}
            onClick={() => onSquareClick(piece.square)}
          />
        );
      })}
    </group>
  );
};
