import { useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function CodeGenerator() {
  const [entities, setEntities] = useState("");
  const [path, setPath] = useState("");

  const generateFiles = () => {
    const zip = new JSZip();
    const entityList = entities
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e);

    entityList.forEach((entity) => {
      //IRepository
      const repoContent = `
        package ${path}.repository;

        import org.springframework.data.jpa.repository.JpaRepository;

        public interface I${entity}Repository extends JpaRepository<${entity}, Long> { 
            // methods here
        }`;

      //IService
      const serviceInterface = `
        package ${path}.service;

        public interface I${entity}Service { 
            // methods here
        }`;

      //Service
      const serviceImpl = `
        package ${path}.service.impl;

        import ${path}.service.I${entity}Service;
        import org.springframework.stereotype.Service;

        @Service
        public class ${entity}Service implements I${entity}Service { 
            // implementation here
        }`;

      zip.file(`repository/I${entity}Repository.java`, repoContent);
      zip.file(`service/I${entity}Service.java`, serviceInterface);
      zip.file(`service/impl/${entity}Service.java`, serviceImpl);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "generated-code.zip");
    });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Java Code Generator</h1>
      <div>Đường dẫn đến file:</div>
      <input
        type="text"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="Ví dụ: com.example.project_name"
      />
      <div>Entity</div>
      <textarea
        value={entities}
        onChange={(e) => setEntities(e.target.value)}
        placeholder="Ví dụ: User, Role"
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={generateFiles}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate & Download
      </button>
    </div>
  );
}
