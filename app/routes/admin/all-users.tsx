import { users } from "~/constants";
import { Header } from "../../../components";
import { ColumnsDirective, GridComponent, ColumnDirective } from "@syncfusion/ej2-react-grids";

const AllUsers = () => {
  return (
    <main className="dashboard wrapper">
      <Header
        title="Manage Users"
        description="Filter, sort, and access detailed user profiles"
      />
      <GridComponent dataSource={users}>
        <ColumnsDirective>
        <ColumnDirective
         field="name"
         headerText="Name"
         width="200"
         textAlign="Left"/>
        </ColumnsDirective>
      </GridComponent>
    </main>
  );
};

export default AllUsers;
