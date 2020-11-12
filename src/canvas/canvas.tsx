import { observer } from "mobx-react-lite";
import React from "react";
import { useStore } from "../App";
import { ArrowView } from "./arrow";
import "./canvas.css";
import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultPortModel,
  RightAngleLinkFactory,
  LinkModel,
  RightAngleLinkModel,
  DefaultLabelModel,
  PathFindingLinkFactory,
  PortModelAlignment,
} from "@projectstorm/react-diagrams";
import { AbstractModelFactory } from "@projectstorm/react-canvas-core";
import {
  CustomNodeFactory,
  CustomNodeModel,
  customPortFactory,
} from "../node/custom-node";
import { Step } from "../step/step";

type Props = {};

// When new link is created by clicking on port the RightAngleLinkModel needs to be returned.
export class RightAnglePortModel extends DefaultPortModel {
  createLinkModel(factory?: AbstractModelFactory<LinkModel>) {
    return new RightAngleLinkModel();
  }
}

export const MainCanvas: React.FC<Props> = observer(() => {
  const rootStore = useStore();
  const ops = [...rootStore.nodes.values()];

  const engine = React.useMemo(() => {
    const engine = createEngine({
      registerDefaultZoomCanvasAction: false,
      registerDefaultDeleteItemsAction: false,
    });
    engine.getLinkFactories().registerFactory(new RightAngleLinkFactory());
    engine.getPortFactories().registerFactory(customPortFactory);
    engine.getNodeFactories().registerFactory(new CustomNodeFactory());
    // setup the diagram model

    const model = new DiagramModel();
    // create four nodes in a way that straight links wouldn't work
    const node1 = new CustomNodeModel(ops[10].data as Step);
    node1.setPosition(340, 350);

    const node2 = new DefaultNodeModel("Node B", "rgb(255,255,0)");
    const port2 = node2.addPort(new DefaultPortModel(false, "out-1", "Out"));
    node2.setPosition(240, 80);
    const node3 = new DefaultNodeModel("Node C", "rgb(192,255,255)");
    const port3 = node3.addPort(new DefaultPortModel(true, "in-1", "In"));
    node3.setPosition(540, 180);
    const node4 = new DefaultNodeModel("Node D", "rgb(192,0,255)");
    const port4 = node4.addPort(new DefaultPortModel(true, "in-1", "In"));
    node4.setPosition(95, 185);
    const pathfinding = engine
      .getLinkFactories()
      .getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME);

    // linking things together
    const link1 = port4.link(
      node1.getPort(PortModelAlignment.LEFT)!,
      pathfinding
    );
    link1.addLabel(new DefaultLabelModel({ label: "dwdw" }));

    const link2 = port2.link(port3, pathfinding);

    // add all to the main model
    model.addAll(node1, node2, node3, node4, link1, link2);

    // load model into engine and render
    engine.setModel(model);
    return engine;
  }, [ops]);
  console.log(engine);

  return (
    <div
      style={{
        overflow: "auto",
        flex: "1",
        outline: "none",
        background: "white",
      }}
      id="canvas-scroll"
      tabIndex={0}
      onMouseMove={(_) => {
        if (rootStore.selectedPointIndex !== undefined) {
          const target = document.getElementById(
            "canvas-scroll"
          )! as HTMLElement;
          target.focus();
        }
      }}
      onKeyUp={(event) => {
        if (
          event.key === "Escape" &&
          rootStore.selectedPointIndex !== undefined &&
          rootStore.selectedConnection !== undefined
        ) {
          rootStore.selectedConnection.innerPoints.splice(
            rootStore.selectedPointIndex,
            1
          );
          rootStore.selectedPointIndex = undefined;
        }
      }}
    >
      <div className="canvas-wrapper" style={{ background: "white" }}>
        {/* <CanvasWidget engine={engine} className="canvas-widget" /> */}
        <rootStore.globalData.CanvasView />
        <svg
          style={{ width: "100%", height: "100%", position: "absolute" }}
          id="canvas-svg"
        >
          {ops
            .flatMap((op) => op.inputs)
            .map((connection) => (
              <ArrowView
                connection={connection}
                key={connection.from.key + connection.to.key}
              />
            ))}
        </svg>
      </div>
    </div>
  );
});
