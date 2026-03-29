"""クォータニオンとオイラー角の相互変換ユーティリティ"""
import numpy as np
from scipy.spatial.transform import Rotation


def normalize_quaternion(w: float, x: float, y: float, z: float) -> dict:
    """クォータニオンを正規化する"""
    q = np.array([x, y, z, w])
    norm = np.linalg.norm(q)
    if norm < 1e-8:
        return {"w": 1.0, "x": 0.0, "y": 0.0, "z": 0.0}
    q_normalized = q / norm
    return {
        "w": float(q_normalized[3]),
        "x": float(q_normalized[0]),
        "y": float(q_normalized[1]),
        "z": float(q_normalized[2]),
    }


def quaternion_to_euler(w: float, x: float, y: float, z: float) -> dict:
    """クォータニオンからオイラー角(度)への変換
    
    Returns:
        roll (X軸回転), pitch (Y軸回転), yaw (Z軸回転) in degrees
    """
    # scipy は [x, y, z, w] 形式
    q = normalize_quaternion(w, x, y, z)
    r = Rotation.from_quat([q["x"], q["y"], q["z"], q["w"]])
    # 'xyz' intrinsic rotations (roll, pitch, yaw)
    euler = r.as_euler("xyz", degrees=True)
    return {
        "roll": float(euler[0]),
        "pitch": float(euler[1]),
        "yaw": float(euler[2]),
    }


def euler_to_quaternion(roll: float, pitch: float, yaw: float) -> dict:
    """オイラー角(度)からクォータニオンへの変換
    
    Args:
        roll: X軸回転 (degrees)
        pitch: Y軸回転 (degrees)
        yaw: Z軸回転 (degrees)
    """
    r = Rotation.from_euler("xyz", [roll, pitch, yaw], degrees=True)
    q = r.as_quat()  # [x, y, z, w]
    return {
        "w": float(q[3]),
        "x": float(q[0]),
        "y": float(q[1]),
        "z": float(q[2]),
    }
