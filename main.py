from flask import Flask, render_template, jsonify, request
from quaternion_utils import (
    normalize_quaternion,
    quaternion_to_euler,
    euler_to_quaternion,
)

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/quaternion-to-euler", methods=["POST"])
def api_quaternion_to_euler():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Missing JSON data"}), 400
    try:
        result = quaternion_to_euler(
            data["w"], data["x"], data["y"], data["z"]
        )
        return jsonify(result)
    except (KeyError, TypeError, ValueError) as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/euler-to-quaternion", methods=["POST"])
def api_euler_to_quaternion():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Missing JSON data"}), 400
    try:
        result = euler_to_quaternion(
            data["roll"], data["pitch"], data["yaw"]
        )
        return jsonify(result)
    except (KeyError, TypeError, ValueError) as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/normalize-quaternion", methods=["POST"])
def api_normalize_quaternion():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Missing JSON data"}), 400
    try:
        result = normalize_quaternion(
            data["w"], data["x"], data["y"], data["z"]
        )
        return jsonify(result)
    except (KeyError, TypeError, ValueError) as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
