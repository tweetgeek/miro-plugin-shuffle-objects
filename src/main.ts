import IPluginConfig = SDK.IPluginConfig;
import IWidget = SDK.IWidget;

const svgIcon = require('./random.svg');

interface Widget extends IWidget {
  x: number;
  y: number;
  type: string;
  text?: string;
}

interface DeltaPosition {
  id: string;
  deltaX: number;
  deltaY: number;
}

function shuffleArray(array: Array<any>) {
  // eslint-disable-next-line no-plusplus
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line no-param-reassign
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const elementsSameType = (widgets: IWidget[]): boolean =>
  widgets.map(({ type }) => type).filter((v, i, a) => a.indexOf(v) === i).length === 1;

const calculateNewPositions = (selectedWidgets: IWidget[], shuffledWidgets: IWidget[]): DeltaPosition[] => {
  const delta: DeltaPosition[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < shuffledWidgets.length; i++) {
    const deltaX = selectedWidgets[i].bounds.x - shuffledWidgets[i].bounds.x;
    const deltaY = selectedWidgets[i].bounds.y - shuffledWidgets[i].bounds.y;

    if (deltaX !== 0 || deltaY !== 0) {
      delta.push({ id: shuffledWidgets[i].id, deltaX, deltaY });
    }
  }

  return delta;
};

const buildLoaders = (widgets: IWidget[]): Widget[] =>
  [...widgets].map(
    (widget: Widget) =>
      ({
        type: 'sticker',
        text: '👀',
        x: widget.x,
        y: widget.y,
      } as Widget),
  );

const onClick = async () => {
  if (!(await miro.isAuthorized())) {
    await miro.showErrorNotification('🚧👮🏻‍🚔 Żeby mnie użyć, najpierw musisz autoryzować plugin!️ ‍🚔👮🏻🚧');
    return;
  }

  const selectedWidgets: IWidget[] = await miro.board.selection.get();
  if (!selectedWidgets.length) {
    await miro.showErrorNotification('🚨 Najpierw wybierz co mam losować! 😂');
    return;
  }

  if (selectedWidgets.length <= 1) {
    await miro.showErrorNotification('🚨 Nie no... Jak mam losować z jednego elementu... 🤣');
    return;
  }

  if (!elementsSameType(selectedWidgets)) {
    await miro.showErrorNotification('🚨 Eee majster, ale to nie są te same elementy! 👮🏻‍️');
    return;
  }

  const shuffledWidgets: IWidget[] = [...selectedWidgets];
  shuffleArray(shuffledWidgets);

  if (selectedWidgets.map(({ id }) => id).join(',') === shuffledWidgets.map(({ id }) => id).join(',')) {
    await miro.showErrorNotification('Kurna wylosowałem tak samo 😅');
    return;
  }

  const widgetsPosition = calculateNewPositions(selectedWidgets, shuffledWidgets);

  const loaders: IWidget[] = await miro.board.widgets.create(buildLoaders(selectedWidgets));
  const promises = [...widgetsPosition].map((position) =>
    miro.board.widgets.transformDelta(position.id, position.deltaX, position.deltaY),
  );
  await Promise.all(promises);
  await miro.board.widgets.deleteById(loaders.map((item: Widget) => item.id));
  await miro.showNotification('No i narobiłem bałaganu 😎');
};

const config: IPluginConfig = {
  extensionPoints: {
    bottomBar: {
      title: 'Wymieszam za Ciebie kolejność 🙈',
      svgIcon,
      onClick,
    },
  },
};

miro.onReady(async () => {
  try {
    await miro.initialize(config);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    miro.showErrorNotification(error);
  }
});
