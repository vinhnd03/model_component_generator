import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";

export default function CodeGenerator() {
  const generateFiles = (values) => {
    const zip = new JSZip();
    const entityList = values.entities
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e);

    const packagePath =
      values.path && values.path.trim() !== ""
        ? values.path
        : "com.example.project";

    entityList.forEach((entity) => {
      const camelEntity = entity.charAt(0).toLowerCase() + entity.slice(1);
      const repoContent = `package ${packagePath}.repository;

import org.springframework.data.jpa.repository.JpaRepository;

public interface I${entity}Repository extends JpaRepository<${entity}, Long> { 
    // methods here
}`;

      const serviceInterface = `package ${packagePath}.service;

public interface I${entity}Service { 
    // methods here
}`;

      const serviceImpl = `package ${packagePath}.service.impl;

import ${packagePath}.service.I${entity}Service;
import ${packagePath}.repository.I${entity}Repository;
import org.springframework.stereotype.Service;

@Service
public class ${entity}Service implements I${entity}Service {
      private I${entity}Repository ${camelEntity}Repository;
      public ${entity}Service (I${entity}Repository ${camelEntity}Repository){
        this.${camelEntity}Repository = ${camelEntity}Repository;
      }
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

  const validationSchema = Yup.object({
    path: Yup.string()
      // .required("Vui lòng nhập đường dẫn package")
      .matches(
        /^[a-zA-Z_][a-zA-Z0-9_.]*$/,
        "Package không hợp lệ (chỉ chữ, số, dấu chấm, gạch dưới)"
      ),
    entities: Yup.string()
      .required("Vui lòng nhập ít nhất 1 entity")
      .matches(
        /^[A-Za-z][A-Za-z_-]*(\s*,\s*[A-Za-z][A-Za-z_-]*)*$/,
        "Entity không hợp lệ (chỉ chữ cái, dấu - hoặc _, không có dấu phẩy cuối)"
      ),
  });

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Java Code Generator</h1>

      <Formik
        initialValues={{ path: "", entities: "" }}
        validationSchema={validationSchema}
        onSubmit={(values) => generateFiles(values)}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="mb-4">
              <label className="block mb-1">Đường dẫn đến file:</label>
              <Field
                type="text"
                name="path"
                placeholder="Ví dụ: com.example.project_name"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="path"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Entity</label>
              <Field
                as="textarea"
                name="entities"
                placeholder="Ví dụ: User, Role_Admin"
                className="w-full p-2 border rounded"
              />
              <ErrorMessage
                name="entities"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? "Đang tạo..." : "Tải xuống"}
            </button>
          </Form>
        )}
      </Formik>

      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded mt-10">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">
          🛠️ Java Code Generator
        </h2>
        <p className="text-sm text-gray-700">
          Công cụ này giúp bạn sinh ra <strong>Repository</strong>,{" "}
          <strong>Service Interface</strong> và{" "}
          <strong>Service Implementation</strong> cho các entity trong dự án
          Spring Boot.
          <br />
          Chỉ cần nhập tên package và danh sách entity, sau đó tải về file ZIP.
        </p>
        <p className="text-sm text-gray-700">
          <span>Link Github: {""}</span>
          <span>
            <a
              className="underline"
              href="https://github.com/vinhnd03/model_component_generator"
            >
              https://github.com/vinhnd03/model_component_generator
            </a>
          </span>
        </p>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm text-gray-700">
        <h3 className="font-semibold text-yellow-700 mb-2">⚠️ Lưu ý</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Tên thư mục trả về là <code>repository</code> và{" "}
            <code>service/impl</code>.
          </li>
          <li>
            Dự án nên là <strong>Spring Boot</strong> sử dụng{" "}
            <strong>Spring Data JPA</strong>.
          </li>
          <li>
            Tên entity phải viết hoa chữ cái đầu (ví dụ: <code>User</code>,{" "}
            <code>Role</code>).
          </li>
          <li>
            Tên biến trong code sẽ tự động chuyển về chữ thường chữ cái đầu (ví
            dụ: <code>userRepository</code>).
          </li>
          <li>
            Danh sách entity phải cách nhau bằng dấu phẩy, ví dụ:{" "}
            <code>User, Role, Product</code>.
          </li>
          <li>
            Đây là trang web thử nghiệm nên có thể có sai sót. Vui lòng nhập
            đúng định dạng để tránh gặp lỗi.
          </li>
        </ul>
      </div>
    </div>
  );
}
