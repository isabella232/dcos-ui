import * as React from "react";
import { withI18n, i18nMark } from "@lingui/react";
import { t } from "@lingui/macro";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterInputText from "#SRC/js/components/FilterInputText";

import RepositoriesPage from "./RepositoriesPage";
import RepositoriesTable from "./RepositoriesTable";
import RepositoriesAdd from "../RepositoriesAdd";

class RepositoriesTabUI extends React.Component {
  state = { addRepositoryModalOpen: false };

  handleCloseAddRepository = () => {
    this.setState({ addRepositoryModalOpen: false });
  };
  handleOpenAddRepository = () => {
    this.setState({ addRepositoryModalOpen: true });
  };

  render() {
    const { addRepositoryModalOpen } = this.state;

    const { repositories, searchTerm, onSearch, i18n } = this.props;
    return (
      <RepositoriesPage
        addButton={{
          onItemSelect: this.handleOpenAddRepository,
          label: i18nMark("Add Repository"),
        }}
      >
        <div>
          <FilterBar>
            <FilterInputText
              className="flush-bottom"
              placeholder={i18n._(t`Search`)}
              searchString={searchTerm}
              handleFilterChange={onSearch}
            />
          </FilterBar>
          <RepositoriesTable repositories={repositories} filter={searchTerm} />
          <RepositoriesAdd
            numberOfRepositories={repositories.getItems().length}
            open={addRepositoryModalOpen}
            onClose={this.handleCloseAddRepository}
          />
        </div>
      </RepositoriesPage>
    );
  }
}

export default withI18n()(RepositoriesTabUI);
