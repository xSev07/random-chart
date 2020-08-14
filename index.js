const AXIS_PADDING = 40;
const POINT_RADIUS = 5;
let minPoints = 2;
let maxPoints = 10;
let animationSteps = 30;
let stepTime = 30;
let currentAnimationStep = 0;

const canvasElement = document.querySelector('#chart');
const parametersElement = document.querySelector('.chart__parameters');
const minPointsElement = parametersElement.querySelector(`#min-points`);
const maxPointsElement = parametersElement.querySelector(`#max-points`);
const stepsElement = parametersElement.querySelector(`#steps`);
const timeElement = parametersElement.querySelector(`#time`);

const PointParameter = {
    RADIUS: POINT_RADIUS,
    MIN_X: AXIS_PADDING * 2,
    MAX_X: canvasElement.width - AXIS_PADDING * 2,
    MIN_Y: canvasElement.height - AXIS_PADDING - POINT_RADIUS,
    MAX_Y: canvasElement.height - AXIS_PADDING * 2 - POINT_RADIUS * 2,
};

const workSpaceX = PointParameter.MAX_X - PointParameter.MIN_X;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = null;
        this.targetY = null;
        this.stepX = 0;
        this.stepY = 0;
    }

    getCoordinates() {
        return {
            x: this.x,
            y: this.y,
        }
    }

    setTargetCoordinates(x, y) {
        this.targetX = x;
        this.targetY = y;
        this._calculateSteps();
    }

    setCoordinates(x, y) {
        this.x = x;
        this.y = y;
        this._calculateSteps();
    }

    swapCoordinates() {
        [this.x, this.targetX] = [this.targetX, this.x];
        [this.y, this.targetY] = [this.targetY, this.y];
    }

    move() {
        this.x += this.stepX;
        this.y += this.stepY;
    }

    _calculateSteps() {
        this.stepX = (this.targetX - this.x) / animationSteps;
        this.stepY = (this.targetY - this.y) / animationSteps;
    }
}

const setParameters = () => {
    minPoints = parseInt(minPointsElement.value);
    maxPoints = parseInt(maxPointsElement.value);
    animationSteps = parseInt(stepsElement.value);
    stepTime = Math.round(parseInt(timeElement.value) / animationSteps);
};

const getRandomNumberInRange = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const calculateCoordinates = (value, i, gap) => {
    return {
        x: PointParameter.MIN_X + gap * i,
        y: PointParameter.MIN_Y - value,
    }
};

const generatePoints = () => {
    const pointCount = getRandomNumberInRange(minPoints, maxPoints);
    const pointGap = Math.floor(workSpaceX / (pointCount - 1));
    return Array.apply(null, {length: pointCount})
        .map((currentValue, index) => {
            const coordinates = calculateCoordinates(getRandomNumberInRange(0, PointParameter.MAX_Y), index, pointGap);
            return new Point(coordinates.x, coordinates.y);
        });
};

const renderAxis = (ctx) => {
    ctx.fillStyle= 'black';
    ctx.beginPath();
    ctx.moveTo(AXIS_PADDING, AXIS_PADDING);
    ctx.lineTo(AXIS_PADDING, canvasElement.height - AXIS_PADDING);
    ctx.lineTo(canvasElement.width - AXIS_PADDING, canvasElement.height - AXIS_PADDING);
    ctx.stroke();
};

const renderPoint = (ctx, x, y) => {
    ctx.fillStyle= 'white';
    ctx.beginPath();
    ctx.arc(x, y, PointParameter.RADIUS, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
};

const renderChart = (ctx, points) => {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    renderAxis(ctx);

    ctx.beginPath();
    points.forEach((it) => {
        it.move();
        const coordinates = it.getCoordinates();
        ctx.lineTo(coordinates.x, coordinates.y);
    });
    ctx.stroke();

    points.forEach((it) => {
        const coordinates = it.getCoordinates();
        renderPoint(ctx, coordinates.x, coordinates.y);
    });
};

const calculateResultPoints = (oldPoints, newPoints) => {
    let result = [];
    const currentLength = oldPoints.length;
    const newLength = newPoints.length;

    if (currentLength < newLength) {
        const k = newLength / currentLength;

        result = newPoints.map((it, index) => {
            const i = Math.floor(index / k);
            const coordinates = oldPoints[i].getCoordinates();

            it.swapCoordinates();
            it.setCoordinates(coordinates.x, coordinates.y);
            return it;
        });

    } else if (currentLength >= newLength) {
        const k = currentLength / newLength;

        result = oldPoints.map((it, index) => {
            const i = Math.floor(index / k);
            const coordinates = newPoints[i].getCoordinates();

            it.setTargetCoordinates(coordinates.x, coordinates.y);
            return it;
        });
    }

    return result;
};

const animatedChange = () => {
    if (currentAnimationStep !== 0) {
        return;
    }
    const newPoints = generatePoints();
    const points = calculateResultPoints(currentPoints, newPoints);

    const intervalId = setInterval(() => {
        if (currentAnimationStep < animationSteps) {
            currentAnimationStep++;
            renderChart(ctx, points);
        } else {
            clearInterval(intervalId);
            currentAnimationStep = 0;
            currentPoints = newPoints;
        }
    }, stepTime);
};

const onCanvasClick = () => {
    animatedChange();
};

const onFormSubmit = (evt) => {
    evt.preventDefault();
    setParameters();
    animatedChange();
};

let currentPoints = generatePoints();

const ctx = canvasElement.getContext("2d");
renderChart(ctx, currentPoints);

canvasElement.addEventListener(`click`, onCanvasClick);
parametersElement.addEventListener(`submit`, onFormSubmit);
